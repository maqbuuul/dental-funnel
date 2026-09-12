'use client';

import { useEffect, useState } from 'react';

type Slot = { startsAt: string; endsAt: string };
type Day = { date: string; label: string; weekday: string; slots: Slot[] };

const time = (iso: string, tz: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })
    .format(new Date(iso));

/**
 * Pick a day, pick a time, done.
 *
 * Two decisions worth keeping:
 *
 *  - the day strip scrolls horizontally rather than becoming a month grid. A
 *    month grid is mostly empty squares and makes somebody hunt; the next ten
 *    working days is what they actually want.
 *
 *  - a slot taken between loading and clicking returns a 409, and the UI
 *    reloads availability rather than insisting. Somebody else got there first
 *    and saying so plainly is better than a generic failure.
 */
export default function Booker({ refId }: { refId: string }) {
  const [days, setDays] = useState<Day[]>([]);
  const [tz, setTz] = useState('America/New_York');
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ when: string; firstName: string } | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/slots', { cache: 'no-store' });
      const json = await res.json();
      setDays(json.days ?? []);
      setTz(json.timezone ?? 'America/New_York');
      setActiveDay(0);
    } catch {
      setError('Could not load times.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function book(startsAt: string) {
    if (booking) return;
    setBooking(startsAt);
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ref: refId, startsAt }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.message ?? 'That time is no longer available.');
        await load();
        return;
      }
      setConfirmed({ when: json.when, firstName: json.firstName });
    } catch {
      setError('Something went wrong. Give us a call and we’ll book you in.');
    } finally {
      setBooking(null);
    }
  }

  if (confirmed) {
    return (
      <div className="booked" role="status">
        <div className="booked-mark" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 20 20" fill="none">
            <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2>You&apos;re booked in{confirmed.firstName ? `, ${confirmed.firstName}` : ''}</h2>
        <p className="booked-when">{confirmed.when}</p>
        <p className="booked-note">
          We&apos;ll text you a confirmation shortly. If something changes, just call
          us — no need to explain yourself.
        </p>
      </div>
    );
  }

  if (loading) return <div className="booker-skeleton" aria-busy="true">Loading times…</div>;

  if (days.length === 0) {
    return (
      <div className="card">
        <h3>No times online right now</h3>
        <p style={{ margin: 0, color: 'var(--ink-2)' }}>
          Give us a ring and we&apos;ll find you a slot.
        </p>
      </div>
    );
  }

  const day = days[activeDay];

  return (
    <div className="booker">
      <div className="day-strip" role="tablist" aria-label="Choose a day">
        {days.map((d, i) => (
          <button
            key={d.date}
            role="tab"
            aria-selected={i === activeDay}
            className={`day-chip ${i === activeDay ? 'on' : ''}`}
            onClick={() => setActiveDay(i)}
          >
            <span className="dow">{d.weekday}</span>
            <span className="dnum">{d.label.replace(/^[A-Za-z]+,?\s*/, '')}</span>
            <span className="dct">{d.slots.length} free</span>
          </button>
        ))}
      </div>

      <div className="slot-grid">
        {day.slots.map((s) => (
          <button
            key={s.startsAt}
            className="slot"
            disabled={booking !== null}
            onClick={() => book(s.startsAt)}
          >
            {booking === s.startsAt ? 'Booking…' : time(s.startsAt, tz)}
          </button>
        ))}
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <p className="form-note" style={{ textAlign: 'left' }}>
        Times shown for {tz.split('/')[1]?.replace('_', ' ')}. Appointments run 45–60 minutes.
      </p>
    </div>
  );
}
