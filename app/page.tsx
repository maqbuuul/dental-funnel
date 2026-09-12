import LeadForm from '@/components/LeadForm';

const PRACTICE = process.env.NEXT_PUBLIC_PRACTICE_NAME ?? 'Bright Smile Dental';
const CITY = process.env.NEXT_PUBLIC_PRACTICE_CITY ?? 'Charlotte';
const PHONE = process.env.NEXT_PUBLIC_PRACTICE_PHONE ?? '+1 704 555 0142';
const TEL = PHONE.replace(/[^\d+]/g, '');

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Phone() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 3h3l1.5 3.7-2 1.4a10 10 0 004.9 4.9l1.4-2L17 12.5v3a1.5 1.5 0 01-1.7 1.5A13.5 13.5 0 013 4.7 1.5 1.5 0 014.5 3z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/** Terms of the offer, restated. Not testimonials — nothing here is invented. */
const TERMS = [
  { k: '$59', v: 'Exam and full digital X-rays. Nothing owed on the day beyond it.' },
  { k: '45–60 min', v: 'One appointment, not a five-minute look and a rebooking.' },
  { k: 'Most PPO', v: 'Plans accepted, and we check your coverage before you come in.' },
  { k: 'No pressure', v: 'A written plan with prices. Nothing is booked unless you say so.' },
];

export default function Page() {
  return (
    <>
      {/* This demographic calls. A form-only dental page throws away a third
          of its conversions, so the number is tappable and always visible. */}
      <header className="nav">
        <div className="nav-in">
          <div className="brand">{PRACTICE}<span>{CITY}</span></div>
          <a className="call" href={`tel:${TEL}`}><Phone />{PHONE}</a>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">New patient offer · {CITY}</span>
            <h1>
              New patient exam and{' '}
              {/* never let the hyphen break across lines */}
              <span style={{ whiteSpace: 'nowrap' }}>X-rays</span> for $59
            </h1>
            <p className="lede">
              No lecture about how long it&apos;s been. Just a clear look at where
              things stand, and what — if anything — actually needs doing.
            </p>
            <ul className="chips">
              <li><Tick /> Most PPO plans accepted</li>
              <li><Tick /> No insurance needed</li>
              <li><Tick /> Written plan, prices up front</li>
            </ul>
          </div>

          {/* The form sits in the hero on desktop. Making somebody scroll past
              six sections to find it throws away the visitors who arrived ready. */}
          <div className="form-card" id="book">
            <h2>Book your visit</h2>
            <p className="sub">Takes about thirty seconds.</p>
            <div className="price-line">
              <span className="price-now">$59</span>
              <span className="price-was">$285</span>
              <span className="price-tag">New patients</span>
            </div>
            <LeadForm id="lead-form" />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <h2>What $59 covers</h2>
            <p>The whole visit. There is no separate exam fee and no membership to join.</p>
          </div>
          <div className="grid-2">
            <ul className="includes">
              <li><Tick /><span>Full dental exam</span></li>
              <li><Tick /><span>Complete digital X-rays</span></li>
              <li><Tick /><span>Oral cancer screening</span></li>
              <li><Tick /><span>A written treatment plan, with prices, before anything is scheduled</span></li>
              <li><Tick /><span>45–60 minutes — not a five-minute look and a rebooking</span></li>
            </ul>
            <div className="card">
              <h3>Not insured?</h3>
              <p style={{ marginBottom: 0, color: 'var(--ink-2)' }}>
                The $59 covers the visit in full whether you&apos;re insured or not.
                If you do have a PPO plan, bring your card and we&apos;ll check your
                coverage before you come in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of the offer, designed. Real reviews go here on a live build --
          see components/Reviews.tsx. Invented testimonials are a fabricated
          endorsement, and stock-photo faces do the same damage. */}
      <section className="section">
        <div className="wrap">
          <div className="trust">
            {TERMS.map((t) => (
              <div className="card" key={t.k}>
                <span className="k">{t.k}</span>
                <span className="v">{t.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap">
          <div className="section-head">
            <h2>What actually happens</h2>
            <p>Four steps, and you leave knowing where you stand.</p>
          </div>
          <ol className="steps">
            <li>
              <div>
                <strong>You arrive and we take X-rays</strong>
                <span>About ten minutes, and they don&apos;t hurt.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>The dentist examines and talks you through it</strong>
                <span>On the screen, so you can see what they see.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>You get a written plan with prices</strong>
                <span>Nothing is booked on the day unless you want it to be.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>You leave knowing where you stand</strong>
                <span>Even if the answer is &ldquo;nothing needs doing&rdquo;, which it often is.</span>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Questions people ask</h2>
          </div>
          <div className="faq">
            <details open>
              <summary>What if I need work done?</summary>
              <p>
                You&apos;ll get a written plan with prices on the day. Nothing is
                scheduled unless you decide to schedule it. You&apos;re free to take
                the plan away and think about it, or get a second opinion.
              </p>
            </details>
            <details>
              <summary>Will it hurt?</summary>
              <p>
                An exam and X-rays don&apos;t hurt. If you&apos;re anxious about dental
                visits, say so when you book — we&apos;ll go slower and explain each
                step before it happens.
              </p>
            </details>
            <details>
              <summary>Do I need insurance?</summary>
              <p>No. The $59 covers the full visit whether you&apos;re insured or not.</p>
            </details>
            <details>
              <summary>How long does it take?</summary>
              <p>Between 45 minutes and an hour. We don&apos;t double-book, so you won&apos;t be waiting.</p>
            </details>
            {/* The highest-value copy on the page. It names the real barrier --
                shame, not price -- and almost no competitor will have written it. */}
            <details>
              <summary>It&apos;s been years since I&apos;ve seen a dentist.</summary>
              <p>
                Then this is exactly the appointment for you, and you&apos;re in more
                company than you think. We&apos;re not going to lecture you about it —
                we&apos;re going to tell you where things stand and what your options are.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="closer">
        <div className="wrap grid-2">
          <div>
            <h2>Book your $59 exam</h2>
            <p>
              {PRACTICE} · {CITY}. We&apos;ll text to confirm within a few minutes.
            </p>
            <p className="or-call">
              Prefer to talk to someone? Call <a href={`tel:${TEL}`}>{PHONE}</a> —
              a real person answers.
            </p>
          </div>
          <div style={{ alignSelf: 'center' }}>
            <a className="btn" href="#book" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
              Book my $59 exam
            </a>
          </div>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <p style={{ margin: 0 }}>{PRACTICE} · {CITY}</p>
          <p className="fine">
            Demonstration build for a portfolio. The practice name, contact details
            and offer are illustrative; no real patient data is collected here.
          </p>
        </div>
      </footer>
    </>
  );
}
