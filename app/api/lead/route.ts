import { NextRequest, NextResponse } from 'next/server';
import { insertLead, markCapi } from '@/lib/db';
import { sendCapiEvent } from '@/lib/capi';

export const runtime = 'nodejs'; // CAPI hashing needs node:crypto

/**
 * Receives the form.
 *
 * Order matters and is deliberate: the lead is written first, then tracking is
 * attempted. If Meta is down, the practice still gets the patient. A funnel
 * that loses a lead because a pixel failed has its priorities backwards.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const first_name = String(body.first_name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const email = String(body.email ?? '').trim() || undefined;
  const preferred_time = String(body.preferred_time ?? '').trim() || undefined;
  const event_id = String(body.event_id ?? '').trim();
  const attribution = (body.attribution ?? {}) as Record<string, string>;

  if (!first_name || !phone || !event_id) {
    return NextResponse.json(
      { ok: false, error: 'first_name, phone and event_id are required' },
      { status: 400 },
    );
  }
  // A phone number is the actual asset here. Reject something that cannot be
  // dialled rather than storing it and finding out at call time.
  if (phone.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ ok: false, error: 'phone looks invalid' }, { status: 400 });
  }

  const userAgent = req.headers.get('user-agent') ?? undefined;

  let leadId: number | undefined;
  try {
    leadId = await insertLead({
      event_id, first_name, phone, email, preferred_time,
      attribution, user_agent: userAgent,
    });
  } catch (err) {
    console.error('lead insert failed', err);
    return NextResponse.json({ ok: false, error: 'could not save lead' }, { status: 500 });
  }

  // Duplicate submit. Already saved, already tracked -- say yes and move on.
  if (leadId === undefined) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Everything below is best-effort. None of it can fail the request.
  const origin = req.headers.get('origin') ?? new URL(req.url).origin;
  const capi = await sendCapiEvent({
    eventId: event_id,
    eventName: 'Lead',
    sourceUrl: `${origin}${attribution.landing_page ?? '/'}`,
    clientIp: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    userAgent,
    email, phone, firstName: first_name,
    fbclid: attribution.fbclid,
  });
  markCapi(event_id, capi.ok, capi.detail).catch(() => {});

  const hook = process.env.N8N_LEAD_WEBHOOK_URL;
  if (hook) {
    // Fire and forget. The follow-up sequence starting late is survivable;
    // the form hanging while we wait for n8n is not.
    fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ lead_id: leadId, event_id, first_name, phone, email,
                             preferred_time, attribution }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, lead_id: leadId });
}
