'use client';

import { useEffect, useRef, useState } from 'react';
import { resolveTouch, newEventId, type Touch } from '@/lib/attribution';

declare global {
  interface Window { fbq?: (...args: unknown[]) => void }
}

/**
 * Four fields. Everything else can be asked on the phone, and every extra
 * field costs conversions.
 *
 * The hidden attribution values are resolved on mount rather than read at
 * submit time, so a visitor who lands on a campaign URL and then navigates
 * within the site still carries their first touch.
 */
export default function LeadForm({ id }: { id?: string }) {
  const [touch, setTouch] = useState<Touch>({});
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState('');
  const eventId = useRef<string>('');

  useEffect(() => {
    setTouch(resolveTouch());
    eventId.current = newEventId();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError('');

    const fd = new FormData(e.currentTarget);
    const payload = {
      first_name: String(fd.get('first_name') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      email: String(fd.get('email') ?? ''),
      preferred_time: String(fd.get('preferred_time') ?? ''),
      event_id: eventId.current,
      attribution: touch,
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Something went wrong');

      // Browser pixel, sharing the event id with the server call so Meta
      // deduplicates rather than counting the conversion twice.
      window.fbq?.('track', 'Lead', { content_name: 'new-patient-exam' },
                   { eventID: eventId.current });

      window.location.href = '/thank-you';
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <form id={id} className="lead-form" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="first_name">First name</label>
        <input id="first_name" name="first_name" autoComplete="given-name" required />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" type="tel" inputMode="tel"
               autoComplete="tel" required />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" inputMode="email"
               autoComplete="email" />
      </div>

      <div className="field">
        <label htmlFor="preferred_time">What suits you best?</label>
        <select id="preferred_time" name="preferred_time" defaultValue="Morning">
          <option>Morning</option>
          <option>Afternoon</option>
          <option>Evening</option>
        </select>
      </div>

      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Booking…' : 'Book my $59 exam'}
      </button>

      {state === 'error' && (
        <p className="form-error" role="alert">
          {error}. Give us a call instead — we&apos;ll sort it out in a minute.
        </p>
      )}

      <p className="form-note">
        We&apos;ll text to confirm within a few minutes. No marketing lists, no spam.
      </p>
    </form>
  );
}
