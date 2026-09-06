'use client';

/**
 * First-touch attribution capture.
 *
 * A lead that arrives without a click ID can be counted but not traced. When
 * that patient later attends, there is no way to tell the ad platform which
 * click produced them -- so the platform keeps optimising toward form fills
 * instead of toward people who turn up.
 *
 * Two decisions worth knowing:
 *
 * 1. FIRST touch wins. Someone who clicks an ad, leaves, and comes back by
 *    searching the practice name belongs to the ad. Last-touch would hand that
 *    conversion to organic and quietly defund the campaign that produced it.
 *
 *    The one exception: a paid visit arriving after an untracked one takes
 *    credit, because the untracked visit had no campaign to credit anyway.
 *
 * 2. Click IDs matter more than UTMs. UTMs get stripped by redirects, link
 *    shorteners and some in-app browsers. `fbclid` survives, because Meta
 *    appends it after the redirect chain.
 */

const STORE_KEY = 'df_first_touch';
const TTL_DAYS = 90;

export const CLICK_IDS = [
  'fbclid', 'gclid', 'wbraid', 'gbraid', 'msclkid', 'ttclid', 'li_fat_id',
] as const;

export const UTMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
] as const;

export type Touch = Record<string, string> & { _t?: number };

export const ATTRIBUTION_FIELDS = [
  ...CLICK_IDS, ...UTMS, 'landing_page', 'referrer', 'first_seen_at',
] as string[];

function read(): Touch | null {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Touch;
    if (Date.now() - (parsed._t ?? 0) > TTL_DAYS * 864e5) return null;
    return parsed;
  } catch {
    // private browsing, blocked storage, corrupt value -- all non-fatal
    return null;
  }
}

function write(t: Touch) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...t, _t: Date.now() }));
  } catch {
    /* storage unavailable; the in-memory copy still reaches the form */
  }
}

export function resolveTouch(): Touch {
  if (typeof window === 'undefined') return {};

  const q = new URLSearchParams(window.location.search);
  const current: Touch = {};
  let sawCampaign = false;

  for (const k of [...CLICK_IDS, ...UTMS]) {
    const v = q.get(k);
    if (v) {
      current[k] = v;
      sawCampaign = true;
    }
  }

  const stored = read();
  if (stored) {
    const storedHasClickId = CLICK_IDS.some((k) => stored[k]);
    const currentHasClickId = CLICK_IDS.some((k) => current[k]);
    if (storedHasClickId || !currentHasClickId) return stored;
  }

  if (!sawCampaign) {
    // Direct or organic. Record it anyway -- "no campaign" is data, and a
    // funnel that only stores paid visits cannot report its own coverage.
    current.utm_source = document.referrer ? 'referral' : 'direct';
    current.utm_medium = 'none';
  }

  current.landing_page = window.location.pathname;
  current.referrer = document.referrer || '';
  current.first_seen_at = new Date().toISOString();

  write(current);
  return current;
}

/** Stable id shared by the browser pixel and the server-side CAPI call. */
export function newEventId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `ev_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}
