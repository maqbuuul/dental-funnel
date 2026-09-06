# Follow-up sequences

Four workflows in GoHighLevel. Same structure as
[`ghl-provisioner`](../ghl-provisioner/docs/workflow-specs.md), with dental copy.

Build in order — each depends on fields the previous one writes.

---

## W1 · Speed to lead

**Trigger:** form submitted

| # | Action |
|---|---|
| 1 | Exit if `quiet_hours_optout` |
| 2 | Wait until 08:00–20:00 in the practice timezone |
| 3 | Send **S1** |
| 4 | Set `confirmation_status` = `pending` |
| 5 | Tag `source-{{contact.first_touch_channel}}` |
| 6 | Wait 10 min, or until they reply |
| 7 | Replied → exit |
| 8 | Send **S2** |
| 9 | Wait 30 min |
| 10 | Still nothing → task for the front desk: "Call {{contact.first_name}}" |

**Ten minutes, not five.** Five reads as automated. Ten reads as a person who
got pulled away.

---

## W2 · Booking confirmation

**Trigger:** appointment status `Booked`

| # | Action |
|---|---|
| 1 | Send **C1** — asks for a one-word reply |
| 2 | Send **C2** email — address, map, parking, what to bring |
| 3 | `confirmation_status` = `pending`, tag `unconfirmed` |
| 4 | Wait 4 hours |
| 5 | Replied Y/yes/confirm → **A**. Otherwise → **B** |
| 6A | `confirmation_status` = `confirmed`, `confirmed_at` = now, tag `confirmed`, remove `unconfirmed`, move opportunity → **Confirmed** |
| 6B | Send **C3**, wait 20 hours, hand to W3 |

**Move the opportunity only on a real reply.** Treating a delivered message as a
confirmation merges people who answered with people who ignored you, and then
the pipeline can't tell you which bookings are real.

---

## W3 · Reminders

**Trigger:** appointment 24 hours away

24h → **R1**. Then at 2 hours, **R2** if confirmed, **R3** if not.

Three touches maximum. A fourth doesn't raise show rate and measurably raises
opt-outs.

---

## W4 · No-show recovery

**Trigger:** appointment status `No Show`

Increment `no_show_count`, move to **No Show**, wait 2 hours, send **N1**. Wait
a day, send **N2** if not rebooked. Then stop.

**Hard stop at three no-shows.** Tag `no-show-repeat`, exit, notify a human. At
that point the person isn't a lead, and continuing to text them costs goodwill
and deliverability.

---

## Message library

**S1 — first touch**
> Hi {{contact.first_name}}, it's {{custom_values.practice_name}} — thanks for
> booking the $59 exam. I've got a couple of openings this week. Would mornings
> or afternoons suit you better?

**S2 — nudge**
> Just checking this reached you, {{contact.first_name}}. Reply with a day that
> works and I'll hold a slot.

**C1 — confirmation ask**
> You're booked for {{appointment.start_time}} with
> {{custom_values.dentist_name}}. Reply Y to confirm, or R if you need to move
> it.

**C2 — logistics email**
Subject: `Your visit on {{appointment.date}}`
> Address, map link, parking, what to bring (insurance card if you have one),
> how long it takes, and one line on what happens at the visit. No selling.

**C3 — soft re-ask**
> Hi {{contact.first_name}}, still holding {{appointment.start_time}} for you. A
> quick Y and it's locked in.

**R1 — 24 hours**
> Tomorrow at {{appointment.start_time}}, {{contact.first_name}}. We're at
> {{custom_values.practice_address}} — {{custom_values.maps_link}}.
> {{custom_values.parking_note}}

**R2 — 2 hours, confirmed**
> See you at {{appointment.start_time}} today.

**R3 — 2 hours, unconfirmed**
> {{contact.first_name}}, we've got you at {{appointment.start_time}} today.
> Still good? Y or R.

**N1 — missed, same day**
> We missed you today, {{contact.first_name}} — no problem at all. Here's the
> link if you'd like another time: {{custom_values.reschedule_link}}

**N2 — missed, next day**
> Still happy to fit you in whenever suits. Same link:
> {{custom_values.reschedule_link}}

---

## Copy rules

- Sentence case, no emoji, no exclamation marks. It should read like the front
  desk typed it
- **One ask per message.** A text with two questions gets zero answers
- Every SMS carries an opt-out path per the account's compliance settings
- **Never say "reminder" in a reminder.** Say the time
- No guilt in N1. Someone who missed an appointment already feels bad about it,
  and making it worse loses the rebooking

## A2P note

US SMS through GoHighLevel needs A2P 10DLC registration, which **will not
complete inside a trial account.** Build the workflows anyway — the logic, the
branching and the field writes are all demonstrable, and the messages log even
when they don't deliver.

Say this on camera. Knowing why it wouldn't send in production is a better
answer than a demo that pretends it does.
