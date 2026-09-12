import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { isBookableSlot, SLOT_MS, formatLong } from '@/lib/booking';

export const runtime = 'nodejs';

/**
 * Books a slot against a lead.
 *
 * The lead is identified by its event_id -- a UUID minted in the browser --
 * rather than the sequential lead_id, so the confirmation URL can't be walked
 * by incrementing a number.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 }); }

  const ref = String(body.ref ?? '').trim();
  const startsAt = String(body.startsAt ?? '').trim();

  if (!ref || !startsAt) {
    return NextResponse.json({ ok: false, error: 'ref and startsAt are required' }, { status: 400 });
  }

  // Never trust a time the client sends. Re-derive whether the rules would
  // have offered it at all -- otherwise a crafted request books 3am Sunday.
  if (!isBookableSlot(startsAt)) {
    return NextResponse.json(
      { ok: false, error: 'not_bookable', message: 'That time is not available.' },
      { status: 409 },
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    const lead = await sql`
      SELECT lead_id, first_name FROM leads WHERE event_id = ${ref} LIMIT 1
    ` as { lead_id: string; first_name: string }[];
    if (!lead[0]) {
      return NextResponse.json({ ok: false, error: 'unknown_lead' }, { status: 404 });
    }

    const endsAt = new Date(new Date(startsAt).getTime() + SLOT_MS).toISOString();

    // If this lead already booked, return that rather than creating a second.
    const existing = await sql`
      SELECT appointment_id, starts_at FROM appointments
       WHERE lead_id = ${lead[0].lead_id} AND status = 'booked' LIMIT 1
    ` as { appointment_id: string; starts_at: string }[];
    if (existing[0]) {
      return NextResponse.json({
        ok: true, alreadyBooked: true,
        appointmentId: existing[0].appointment_id,
        startsAt: new Date(existing[0].starts_at).toISOString(),
        when: formatLong(new Date(existing[0].starts_at).toISOString()),
        firstName: lead[0].first_name,
      });
    }

    // The partial unique index decides who wins a race for the same slot.
    const booked = await sql`
      INSERT INTO appointments (lead_id, starts_at, ends_at)
      VALUES (${lead[0].lead_id}, ${startsAt}, ${endsAt})
      ON CONFLICT DO NOTHING
      RETURNING appointment_id
    ` as { appointment_id: string }[];

    if (!booked[0]) {
      return NextResponse.json(
        { ok: false, error: 'slot_taken', message: 'Somebody just took that one. Pick another?' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      appointmentId: booked[0].appointment_id,
      startsAt,
      when: formatLong(startsAt),
      firstName: lead[0].first_name,
    });
  } catch (err) {
    console.error('book failed', err);
    return NextResponse.json({ ok: false, error: 'booking_failed' }, { status: 500 });
  }
}
