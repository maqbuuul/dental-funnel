# Dental Funnel

**A new-patient acquisition funnel with attribution that survives to
attendance.**

Next.js on Vercel · Postgres · Meta Pixel + Conversions API

> 🔗 **Live: [url]**

---

## The offer

**New patient exam + X-rays, $59.**

Chosen over whitening, implants or Invisalign, and the reasoning is a media
buying decision rather than a design one:

- Highest-volume dental offer in North America — it's what practices run
- A concrete price kills the biggest objection before it forms
- Low commitment: it's an appointment, not a treatment decision
- Whitening converts but attracts people who never return. Implants have a
  consideration cycle a landing page can't close

## The angle

People don't avoid the dentist because of price alone. They avoid it because
they expect to be judged for how long it's been.

Price is the stated objection. **Shame is the real one**, and almost no dental
ad answers the second. Hence the subhead — *"No lecture about how long it's
been"* — and the last FAQ answer, which is the highest-value copy on the page.

## What makes it different from every other dental page

Most dental funnels fire `Lead` on form submit and stop. That teaches Meta to
find people who fill in forms, and it gets very good at it.

This one carries the click ID through every hop:

```
ad click ──▶ landing page ──▶ form ──▶ lead row ──▶ appointment ──▶ attended
                 │                        │                            │
        first-touch capture        stored, not derived      CAPI offline conversion
                                                                       │
                                             platform optimises on people who turn up
```

### Three decisions worth defending

**First touch wins, not last.** Someone who clicks an ad, leaves, and returns by
searching the practice name belongs to the ad. Last-touch hands that conversion
to organic and quietly defunds the campaign that produced it. The one exception:
a paid visit arriving after an *untracked* one takes credit, because there was
no campaign to credit before.

**Pixel and CAPI share an `event_id`.** Both report the same conversion. Without
a shared key you count everything twice and the CPL you report is half the real
one — which is worse than no tracking, because it looks fine.

**The lead is saved before tracking is attempted.** If Meta is down, the practice
still gets the patient. A funnel that loses a lead because a pixel failed has
its priorities backwards.

## Coverage

`v_lead_coverage` reports what percentage of leads carry a click ID. Expect
80–90%. Some always arrive untraceable — redirects strip query strings, some
in-app browsers drop them, and some people see the ad and phone the practice
instead of clicking.

**That gap gets published next to every number.** A report that doesn't say how
much it couldn't see has decided not to tell you how much it's guessing.

## Run it

```bash
npm install
cp .env.example .env.local          # DATABASE_URL is the only required one
psql "$DATABASE_URL" -f db/schema.sql
npm run dev
```

Deploy:

```bash
npx vercel
npx vercel env add DATABASE_URL
npx vercel env add NEXT_PUBLIC_META_PIXEL_ID
npx vercel env add META_CAPI_TOKEN
npx vercel --prod
```

Everything except `DATABASE_URL` is optional. With no pixel configured the page
still works and CAPI degrades to a quiet no-op rather than throwing.

## Layout

```
app/page.tsx           the landing page — 8 sections
app/thank-you/         confirmation, with the booking calendar embedded
app/api/lead/          receives the form, saves, then fires CAPI
components/LeadForm    four fields plus hidden attribution
components/Reviews     structure only — see below
lib/attribution.ts     first-touch capture
lib/capi.ts            Conversions API, hashed contact data
db/schema.sql          leads table + v_lead_coverage
copy.md                every section's copy
follow-up.md           W1–W4 sequences and the message library
tracking.md            events, deduplication, the offline loop
```

## On the reviews

`components/Reviews.tsx` ships as **structure with a visible "sample" banner**,
not as invented testimonials.

Fabricated reviews on a public page are a fabricated endorsement, and they're
also the fastest way for a local business to lose the trust the page exists to
build. Stock-photo faces do the same. On a live build both come from the
practice.

When you swap them in, pick reviews that answer objections rather than reviews
that say "great service" — one about cost, one about anxiety, one about a long
gap. Those are the three barriers this page addresses, and the component labels
which is which.

## Verified

```
tsc --noEmit    exit 0
next build      6/6 pages, landing page static, /api/lead dynamic
module tests    6/6 pass — first-touch persistence, paid override,
                direct-traffic recording, event id uniqueness,
                CAPI soft-fail
```

---

Built by [Abdiwahid Ali](https://github.com/maqbuuul). Nairobi.
