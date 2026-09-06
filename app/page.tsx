import LeadForm from '@/components/LeadForm';
import Reviews from '@/components/Reviews';

const PRACTICE = process.env.NEXT_PUBLIC_PRACTICE_NAME ?? 'Bright Smile Dental';
const CITY = process.env.NEXT_PUBLIC_PRACTICE_CITY ?? 'Charlotte';
const PHONE = process.env.NEXT_PUBLIC_PRACTICE_PHONE ?? '+1 704 555 0142';
const TEL = PHONE.replace(/[^\d+]/g, '');

export default function Page() {
  return (
    <>
      {/* This demographic calls. A form-only dental page throws away a third
          of its conversions, so the number is tappable and always visible. */}
      <header className="bar">
        <span className="brand">{PRACTICE}</span>
        <a className="call" href={`tel:${TEL}`}>{PHONE}</a>
      </header>

      <main>
        <section className="hero">
          <h1>New patient exam and X-rays for $59</h1>
          <p className="lede">
            No lecture about how long it&apos;s been. Just a clear look at where
            things stand, and what — if anything — actually needs doing.
          </p>
          <a className="cta" href="#book">Book my $59 exam</a>
          <p className="meta">{PRACTICE} · {CITY} · Most PPO plans accepted</p>
        </section>

        <section className="section offer">
          <h2>What $59 covers</h2>
          <ul className="ticks">
            <li>Full dental exam</li>
            <li>Complete digital X-rays</li>
            <li>Oral cancer screening</li>
            <li>A written treatment plan, with prices, before anything is scheduled</li>
            <li>45–60 minutes — not a five-minute look and a rebooking</li>
          </ul>
          {/* The unspoken fear is not the $59. It is walking out having agreed
              to $4,000 of work. */}
          <p className="offer-foot">
            Normally $285. No insurance needed.{' '}
            <strong>Nothing owed on the day beyond the $59.</strong>
          </p>
        </section>

        <Reviews />

        <section className="section">
          <h2>What actually happens</h2>
          <ol className="steps">
            <li>
              <strong>You arrive and we take X-rays.</strong> About ten minutes,
              and they don&apos;t hurt.
            </li>
            <li>
              <strong>The dentist examines and talks you through what they see</strong>
              {' '}— on the screen, so you can see it too.
            </li>
            <li>
              <strong>You get a written plan with prices.</strong> Nothing is booked
              on the day unless you want it to be.
            </li>
            <li>
              <strong>You leave knowing where you stand.</strong> Even if the answer
              is &ldquo;nothing needs doing&rdquo;, which it often is.
            </li>
          </ol>
        </section>

        <section className="section">
          <h2>Insurance</h2>
          <p>
            We accept most PPO plans, and we&apos;ll check your coverage before you
            come in — just bring your card.
          </p>
          <p>
            Not insured? The $59 covers the visit in full. There&apos;s no separate
            exam fee, no X-ray fee, and no membership to join.
          </p>
        </section>

        <section className="section">
          <h2>Questions people ask</h2>
          <dl className="faq">
            <dt>What if I need work done?</dt>
            <dd>
              You&apos;ll get a written plan with prices on the day. Nothing is
              scheduled unless you decide to schedule it. You&apos;re free to take
              the plan and think about it, or get a second opinion.
            </dd>

            <dt>Will it hurt?</dt>
            <dd>
              An exam and X-rays don&apos;t hurt. If you&apos;re anxious about dental
              visits, say so when you book — we&apos;ll go slower and explain each
              step before it happens.
            </dd>

            <dt>Do I need insurance?</dt>
            <dd>No. The $59 covers the full visit whether you&apos;re insured or not.</dd>

            <dt>How long does it take?</dt>
            <dd>Between 45 minutes and an hour. We don&apos;t double-book, so you won&apos;t be waiting.</dd>

            {/* The highest-value copy on the page. It names the real barrier,
                which is shame rather than price, and almost no competitor
                will have written it. */}
            <dt>It&apos;s been years since I&apos;ve seen a dentist.</dt>
            <dd>
              Then this is exactly the appointment for you, and you&apos;re in more
              company than you think. We&apos;re not going to lecture you about it —
              we&apos;re going to tell you where things stand and what your options are.
            </dd>
          </dl>
        </section>

        <section className="section book" id="book">
          <h2>Book your $59 exam</h2>
          <p className="sub">{PRACTICE} · {CITY}</p>
          <LeadForm id="lead-form" />
          <p className="or-call">
            Prefer to talk to someone? Call <a href={`tel:${TEL}`}>{PHONE}</a> — a
            real person answers.
          </p>
        </section>
      </main>

      <footer className="foot">
        <p>{PRACTICE} · {CITY}</p>
        <p className="fine">
          Demonstration build. Practice details, imagery and reviews are placeholders.
        </p>
      </footer>
    </>
  );
}
