const PRACTICE = process.env.NEXT_PUBLIC_PRACTICE_NAME ?? 'Bright Smile Dental';
const PHONE = process.env.NEXT_PUBLIC_PRACTICE_PHONE ?? '+1 704 555 0142';
const TEL = PHONE.replace(/[^\d+]/g, '');
const BOOKING = process.env.NEXT_PUBLIC_BOOKING_URL;

export const metadata = { title: `You're on the list · ${PRACTICE}` };

/**
 * The calendar goes HERE, not on a "thanks, we'll call you" page.
 *
 * A lead who books their own slot attends at a much higher rate than one
 * waiting for a callback. That difference is the whole gap between selling
 * leads and selling appointments.
 */
export default function ThankYou() {
  return (
    <main className="thanks">
      <h1>Got it — now pick your time</h1>
      <p className="lede">
        We&apos;ll text you a confirmation in the next few minutes. Choose a slot
        below and it&apos;s locked in.
      </p>

      {BOOKING ? (
        <iframe className="cal" src={BOOKING} title="Choose an appointment time" loading="lazy" />
      ) : (
        <div className="cal placeholder">
          <p>Booking calendar embeds here.</p>
          <p className="fine">Set <code>NEXT_PUBLIC_BOOKING_URL</code> to your Cal.com link.</p>
        </div>
      )}

      <p className="or-call">
        Rather just talk? Call <a href={`tel:${TEL}`}>{PHONE}</a>.
      </p>
    </main>
  );
}
