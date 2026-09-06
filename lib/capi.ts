import { createHash } from 'node:crypto';

/**
 * Meta Conversions API.
 *
 * The browser pixel and this server call both report the same conversion. They
 * are deduplicated on a shared `event_id` -- without it every conversion is
 * counted twice and the cost per lead you report is half the real one, which
 * is worse than no tracking because it looks fine.
 *
 * Contact data is SHA-256 hashed before it leaves this process. Raw email and
 * phone must never reach a conversions endpoint.
 */

const API_VERSION = 'v21.0';

const hash = (v: string) =>
  createHash('sha256').update(v.trim().toLowerCase()).digest('hex');

/** E.164-ish: digits only, as Meta expects for phone matching. */
const hashPhone = (v: string) => {
  const digits = v.replace(/\D/g, '');
  return digits ? createHash('sha256').update(digits).digest('hex') : undefined;
};

export type CapiLead = {
  eventId: string;
  eventName: 'Lead' | 'Schedule';
  eventTime?: number;
  sourceUrl: string;
  clientIp?: string;
  userAgent?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  fbclid?: string;
  fbp?: string;
};

export async function sendCapiEvent(e: CapiLead): Promise<{ ok: boolean; detail?: string }> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;

  // Not configured is not an error. The lead is already saved; tracking is
  // secondary and must never take the form down with it.
  if (!pixelId || !token) return { ok: false, detail: 'capi not configured' };

  const user_data: Record<string, unknown> = {};
  if (e.email) user_data.em = [hash(e.email)];
  if (e.phone) {
    const ph = hashPhone(e.phone);
    if (ph) user_data.ph = [ph];
  }
  if (e.firstName) user_data.fn = [hash(e.firstName)];
  if (e.clientIp) user_data.client_ip_address = e.clientIp;
  if (e.userAgent) user_data.client_user_agent = e.userAgent;
  if (e.fbp) user_data.fbp = e.fbp;
  // fbc is the click id in the format Meta expects it back
  if (e.fbclid) user_data.fbc = `fb.1.${Date.now()}.${e.fbclid}`;

  const payload = {
    data: [
      {
        event_name: e.eventName,
        event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
        event_id: e.eventId, // <- the dedup key
        event_source_url: e.sourceUrl,
        action_source: 'website',
        user_data,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) return { ok: false, detail: `meta ${res.status}: ${await res.text()}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : 'capi request failed' };
  }
}
