import Image from 'next/image';
import Booker from '@/components/Booker';

const PRACTICE = process.env.NEXT_PUBLIC_PRACTICE_NAME ?? 'Bright Smile Dental';
const CITY = process.env.NEXT_PUBLIC_PRACTICE_CITY ?? 'Charlotte';
const PHONE = process.env.NEXT_PUBLIC_PRACTICE_PHONE ?? '+1 704 555 0142';
const TEL = PHONE.replace(/[^\d+]/g, '');

export const metadata = { title: `Pick your time · ${PRACTICE}` };
export const dynamic = 'force-dynamic';

/**
 * Step two.
 *
 * The calendar is ours rather than an embed. Partly because a third-party
 * iframe looks like a different website bolted onto this one, and partly
 * because the whole argument of this funnel is that a lead who picks their
 * own time attends more often than one waiting for a callback -- so the
 * booking step deserves to be as considered as the form that precedes it.
 */
export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <>
      <header className="nav">
        <div className="nav-in">
          <div className="brand">{PRACTICE}<span>{CITY}</span></div>
          <a className="call" href={`tel:${TEL}`}>{PHONE}</a>
        </div>
      </header>

      <main className="thanks">
        <ol className="stepper" aria-label="Progress">
          <li className="done">Your details</li>
          <li className="now">Pick a time</li>
        </ol>

        {/* Hidden once a slot is taken -- "now pick your time" sitting above
            "you're booked in" reads as a page that didn't notice. */}
        <div className="intro">
          <h1>Got it — now pick your time</h1>
          <p className="lede-dark">
            Choose a slot below and it&apos;s locked in. We&apos;ll text a confirmation
            within a few minutes.
          </p>
        </div>

        {ref ? (
          <Booker refId={ref} />
        ) : (
          <div className="card">
            <h3>We couldn&apos;t find your details</h3>
            <p style={{ margin: 0, color: 'var(--ink-2)' }}>
              Give us a call on <a href={`tel:${TEL}`}>{PHONE}</a> and we&apos;ll book
              you in — takes a minute.
            </p>
          </div>
        )}

        <aside className="reassure">
          <figure className="shot">
            <Image
              src="/img/surgery-warm.jpg"
              alt="Treatment room at the practice"
              width={1920}
              height={1280}
              sizes="(min-width: 860px) 380px, 100vw"
            />
          </figure>
          <div>
            <h3>What to expect</h3>
            <p>
              Exam, full digital X-rays and a written plan with prices. Nothing is
              booked on the day unless you want it to be — and if it&apos;s been a
              while, we&apos;re not going to lecture you about it.
            </p>
            <p className="or-call" style={{ margin: 0 }}>
              Need a different time? Call <a href={`tel:${TEL}`}>{PHONE}</a>.
            </p>
          </div>
        </aside>
      </main>

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
