# Tracking plan

The part that separates this funnel from every other dental page.

Most dental funnels fire `Lead` on form submit and stop. That teaches Meta to
find people who fill in forms — and it gets very good at it. This one carries
attribution through to attendance, so the platform learns to find people who
turn up.

---

## The events

| Event | Fires on | Sent to | Why |
|---|---|---|---|
| `PageView` | Page load | Pixel, GA4 | Baseline |
| `ViewContent` | Offer box scrolled into view | Pixel | Distinguishes a bounce from a real read |
| `Lead` | Form submit | Pixel **+ CAPI**, GA4 `generate_lead` | The optimisation event most campaigns stop at |
| `Schedule` | Calendar booking confirmed | Pixel **+ CAPI**, GA4 | A booking, not just an enquiry |
| `appointment_attended` | Marked attended in GHL | **CAPI offline conversion** | The one that actually matters |

## Deduplication

Pixel and CAPI both report the same conversion. Without a shared key you count
everything twice and the CPL you report is **half the real one** — which is
worse than no tracking, because it looks fine.

```js
// one id, used by both the browser pixel and the server-side call
const eventId = crypto.randomUUID();

fbq('track', 'Lead', { /* ... */ }, { eventID: eventId });
// then send the same eventID with the CAPI payload
```

Verify in Events Manager: the event should show as **deduplicated**, not as two
separate receipts.

## What travels with each event

From the touch resolved by [`lib/attribution.ts`](lib/attribution.ts) and
posted with the form:

```
fbclid · gclid · utm_source · utm_medium · utm_campaign
landing_page · first_seen_at
```

Plus hashed contact data for CAPI matching — email, phone and first name,
**SHA-256 hashed server-side in `lib/capi.ts` before anything leaves the
process**. Raw PII travels browser → our own API over HTTPS and never reaches a
conversions endpoint in the clear.

Hashing on the server rather than in the browser is deliberate: the browser
copy can be read by any extension or script on the page, and the phone number
is needed unhashed anyway so the practice can actually ring the patient.

## The offline conversion loop

This is the loop, and it's the thing to explain on camera:

```
ad click ──▶ landing page ──▶ form ──▶ GHL contact
   │              │                        │
 fbclid      capture script          click id stored
 preserved   stores first touch       on the contact
                                          │
                                     appointment booked
                                          │
                                     marked ATTENDED
                                          │
                                     Meta CAPI offline conversion
                                          │
                              platform optimises on people who showed up
```

The click ID has to survive every hop to make that last step possible. That is
what `lib/attribution.ts` exists for, and why first touch wins over last.

## Coverage

Publish it next to every number:

```
attributable leads / total leads
```

Expect 80–90%. Some leads always arrive untraceable — redirects strip query
strings, some in-app browsers drop them, and some people see the ad and call
the practice directly instead of clicking.

**Report the gap rather than hiding it.** A performance report that doesn't say
how much it couldn't see has decided not to tell you how much it's guessing —
and an agency that has been oversold to before will notice which kind of report
they're holding.

## Verify before launch

- [ ] Pixel fires on page load — Events Manager **test events**, not assumption
- [ ] `Lead` fires on submit, with the click ID in the payload
- [ ] Pixel and CAPI show as deduplicated, not doubled
- [ ] `?fbclid=test123` on the URL ends up on the contact record in GHL
- [ ] `Schedule` fires on a real booking
- [ ] GA4 realtime shows `generate_lead`
- [ ] No raw email or phone in any network request to a conversions endpoint

The fourth item is the only test that really matters. If the click ID doesn't
reach the contact, everything downstream is decoration.
