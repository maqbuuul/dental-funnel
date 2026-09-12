/**
 * Availability, generated from the practice's own rules.
 *
 * Every constraint here is one that has bitten a real clinic:
 *
 *   - minimum notice, or people book a slot nobody can staff
 *   - a maximum window, or somebody books eleven months out and forgets
 *   - lunch excluded, because the calendar UI will happily offer it
 *   - weekdays only, matching what the front desk actually works
 *
 * Times are generated in the practice's timezone and returned as UTC
 * instants. Doing this the naive way -- building Dates in the server's local
 * zone -- is the bug that books people at the wrong hour and never throws.
 */

export const TZ = process.env.PRACTICE_TIMEZONE ?? 'America/New_York';

const OPEN_HOUR = Number(process.env.BOOKING_OPEN_HOUR ?? 9);
const CLOSE_HOUR = Number(process.env.BOOKING_CLOSE_HOUR ?? 17);
const LUNCH_HOUR = Number(process.env.BOOKING_LUNCH_HOUR ?? 13);
const SLOT_MINUTES = Number(process.env.BOOKING_SLOT_MINUTES ?? 60);
const MIN_NOTICE_HOURS = Number(process.env.BOOKING_MIN_NOTICE_HOURS ?? 2);
const WINDOW_DAYS = Number(process.env.BOOKING_WINDOW_DAYS ?? 30);

/** Milliseconds a timezone is offset from UTC at a given instant. */
function offsetMs(at: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at).reduce<Record<string, string>>((a, p) => {
    if (p.type !== 'literal') a[p.type] = p.value;
    return a;
  }, {});

  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second),
  );
  return asUTC - at.getTime();
}

/** A wall-clock time in `tz`, as the UTC instant it actually refers to. */
function zonedToUtc(y: number, m: number, d: number, h: number, min: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d, h, min);
  // Resolve twice: the first offset can be wrong across a DST boundary.
  const once = guess - offsetMs(new Date(guess), tz);
  return new Date(guess - offsetMs(new Date(once), tz));
}

/** Y/M/D and weekday of an instant, as seen in `tz`. */
function zonedParts(at: Date, tz: string) {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour12: false, weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(at).reduce<Record<string, string>>((a, x) => {
    if (x.type !== 'literal') a[x.type] = x.value;
    return a;
  }, {});
  return {
    y: Number(p.year), m: Number(p.month), d: Number(p.day),
    weekday: p.weekday,
  };
}

export type Slot = { startsAt: string; endsAt: string };
export type Day = { date: string; label: string; weekday: string; slots: Slot[] };

/**
 * Bookable days and times, excluding anything already taken.
 *
 * `taken` is the set of ISO start times already booked -- passed in rather
 * than queried here so this stays a pure function and can be tested.
 */
export function availableDays(taken: Set<string>, now = new Date()): Day[] {
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3600_000;
  const days: Day[] = [];

  for (let offset = 0; offset <= WINDOW_DAYS && days.length < 14; offset++) {
    const cursor = new Date(now.getTime() + offset * 86400_000);
    const { y, m, d, weekday } = zonedParts(cursor, TZ);
    if (weekday === 'Sat' || weekday === 'Sun') continue;

    const slots: Slot[] = [];
    for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
      if (hour === LUNCH_HOUR) continue;
      const start = zonedToUtc(y, m, d, hour, 0, TZ);
      if (start.getTime() < earliest) continue;

      const iso = start.toISOString();
      if (taken.has(iso)) continue;

      slots.push({
        startsAt: iso,
        endsAt: new Date(start.getTime() + SLOT_MINUTES * 60_000).toISOString(),
      });
    }
    if (slots.length === 0) continue;

    days.push({
      date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      weekday,
      label: new Intl.DateTimeFormat('en-US', {
        timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric',
      }).format(zonedToUtc(y, m, d, 12, 0, TZ)),
      slots,
    });
  }
  return days;
}

/** Is this a slot the rules would ever offer? Guards the booking endpoint. */
export function isBookableSlot(iso: string, now = new Date()): boolean {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return false;
  if (at.getTime() < now.getTime() + MIN_NOTICE_HOURS * 3600_000) return false;
  if (at.getTime() > now.getTime() + WINDOW_DAYS * 86400_000) return false;

  const { y, m, d, weekday } = zonedParts(at, TZ);
  if (weekday === 'Sat' || weekday === 'Sun') return false;

  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
    if (hour === LUNCH_HOUR) continue;
    if (zonedToUtc(y, m, d, hour, 0, TZ).toISOString() === at.toISOString()) return true;
  }
  return false;
}

export const SLOT_MS = SLOT_MINUTES * 60_000;

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso));

export const formatLong = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso));
