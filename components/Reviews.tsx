/**
 * Reviews.
 *
 * These are SAMPLES and are rendered with a visible label saying so. Do not
 * remove the label without replacing the content with real reviews.
 *
 * On a live build these come from the practice's own Google listing, with
 * permission, using the reviewer's real first name, city and words. Invented
 * testimonials on a public page are a fabricated endorsement -- and they are
 * also the fastest way for a local business to lose the trust the page exists
 * to build. Stock-photo faces do the same thing.
 *
 * When you swap them in, pick reviews that answer objections rather than
 * reviews that say "great service". This page has three barriers -- cost,
 * anxiety, and a long gap since the last visit -- so use one review for each.
 */

export type Review = {
  name: string;
  city: string;
  text: string;
  answers: 'cost' | 'anxiety' | 'long gap';
};

export const SAMPLE_REVIEWS: Review[] = [
  {
    name: '[First name]',
    city: '[City]',
    answers: 'cost',
    text: 'Replace with a real review about price or insurance — the one where somebody says the cost was clear up front and there was no surprise bill.',
  },
  {
    name: '[First name]',
    city: '[City]',
    answers: 'anxiety',
    text: 'Replace with a real review about nerves — somebody who was anxious about the visit and says how the practice handled it.',
  },
  {
    name: '[First name]',
    city: '[City]',
    answers: 'long gap',
    text: 'Replace with a real review from somebody who had not been to a dentist in years and was not made to feel bad about it.',
  },
];

export default function Reviews({
  reviews = SAMPLE_REVIEWS,
  isSample = true,
}: {
  reviews?: Review[];
  isSample?: boolean;
}) {
  return (
    <section className="section reviews" aria-labelledby="reviews-h">
      <h2 id="reviews-h">What patients say</h2>

      {isSample && (
        <p className="sample-banner" role="note">
          <strong>Sample structure.</strong> Replaced with the practice&apos;s real
          Google reviews before this page goes live.
        </p>
      )}

      <div className="review-grid">
        {reviews.map((r, i) => (
          <figure className="review" key={i}>
            <div className="stars" aria-label="5 out of 5">★★★★★</div>
            <blockquote>{r.text}</blockquote>
            <figcaption>
              {r.name} · {r.city}
              <span className="answers">answers: {r.answers}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
