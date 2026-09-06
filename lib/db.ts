import { neon } from '@neondatabase/serverless';

export type LeadInput = {
  event_id: string;
  first_name: string;
  phone: string;
  email?: string;
  preferred_time?: string;
  attribution: Record<string, string>;
  user_agent?: string;
};

const ATTR = [
  'fbclid', 'gclid', 'wbraid', 'gbraid', 'msclkid',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'landing_page', 'referrer',
] as const;

/**
 * Idempotent on event_id. The form can be double-submitted on a flaky
 * connection, and a duplicate lead is worse than a missed one because the
 * practice calls the same person twice.
 */
export async function insertLead(l: LeadInput) {
  const sql = neon(process.env.DATABASE_URL!);
  const a = l.attribution ?? {};
  const v = (k: string) => a[k] ?? null;
  const firstSeen = a.first_seen_at ? new Date(a.first_seen_at) : null;

  const rows = await sql`
    INSERT INTO leads (
      event_id, first_name, phone, email, preferred_time,
      fbclid, gclid, wbraid, gbraid, msclkid,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      landing_page, referrer, first_seen_at, user_agent
    ) VALUES (
      ${l.event_id}, ${l.first_name}, ${l.phone}, ${l.email ?? null}, ${l.preferred_time ?? null},
      ${v('fbclid')}, ${v('gclid')}, ${v('wbraid')}, ${v('gbraid')}, ${v('msclkid')},
      ${v('utm_source')}, ${v('utm_medium')}, ${v('utm_campaign')}, ${v('utm_content')}, ${v('utm_term')},
      ${v('landing_page')}, ${v('referrer')}, ${firstSeen}, ${l.user_agent ?? null}
    )
    ON CONFLICT (event_id) DO NOTHING
    RETURNING lead_id
  `;
  return rows[0]?.lead_id as number | undefined;
}

export async function markCapi(eventId: string, ok: boolean, detail?: string) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE leads SET capi_sent = ${ok}, capi_detail = ${detail ?? null}
            WHERE event_id = ${eventId}`;
}

export { ATTR };
