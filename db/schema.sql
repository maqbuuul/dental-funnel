-- Leads captured by the funnel.
--
-- Attribution is stored on the lead, not derived later. A campaign id
-- reconstructed weeks after the fact is a guess; one written at the moment of
-- submission is a fact.
--
-- `coverage` is the number this table exists to make answerable: what
-- percentage of leads can be traced to a campaign at all.

CREATE TABLE IF NOT EXISTS leads (
    lead_id        bigserial PRIMARY KEY,
    event_id       text UNIQUE NOT NULL,     -- shared with the pixel, for dedup

    first_name     text NOT NULL,
    phone          text NOT NULL,
    email          text,
    preferred_time text,

    -- first touch, exactly as captured
    fbclid         text,
    gclid          text,
    wbraid         text,
    gbraid         text,
    msclkid        text,
    utm_source     text,
    utm_medium     text,
    utm_campaign   text,
    utm_content    text,
    utm_term       text,
    landing_page   text,
    referrer       text,
    first_seen_at  timestamptz,

    user_agent     text,
    capi_sent      boolean NOT NULL DEFAULT false,
    capi_detail    text,
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_created_idx  ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_campaign_idx ON leads (utm_campaign)
    WHERE utm_campaign IS NOT NULL;

-- Publish the blind spot next to every number.
--
-- Expect 80-90%. Some leads always arrive untraceable: redirects strip query
-- strings, some in-app browsers drop them, and some people see the ad and
-- phone the practice instead of clicking. A report that does not say how much
-- it could not see has decided not to tell you how much it is guessing.
CREATE OR REPLACE VIEW v_lead_coverage AS
SELECT date_trunc('week', created_at)::date              AS week,
       count(*)                                          AS leads,
       count(*) FILTER (WHERE coalesce(fbclid, gclid, msclkid,
                                       wbraid, gbraid) IS NOT NULL) AS with_click_id,
       count(*) FILTER (WHERE utm_campaign IS NOT NULL)  AS with_campaign,
       round(100.0 * count(*) FILTER (WHERE coalesce(fbclid, gclid, msclkid,
                                                     wbraid, gbraid) IS NOT NULL)
             / nullif(count(*), 0), 1)                   AS coverage_pct
FROM leads
GROUP BY 1
ORDER BY 1 DESC;

-- ---------------------------------------------------------------------------
-- Appointments.
--
-- The thank-you page books a real slot rather than embedding somebody else's
-- calendar. That matters beyond looks: a lead who picks their own time attends
-- at a much higher rate than one waiting for a callback, and that difference
-- is the whole gap between selling leads and selling appointments.
--
-- The partial unique index is the actual guard. Two people can open the
-- booking page at the same second and choose the same slot; application logic
-- that checks-then-inserts races with itself, so the database decides.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id bigserial PRIMARY KEY,
    lead_id        bigint REFERENCES leads(lead_id),
    starts_at      timestamptz NOT NULL,
    ends_at        timestamptz NOT NULL,
    status         text NOT NULL DEFAULT 'booked',   -- booked | cancelled
    created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_one_per_slot
    ON appointments (starts_at) WHERE status = 'booked';

CREATE INDEX IF NOT EXISTS appointments_lead_idx ON appointments (lead_id);

-- One row per lead that got as far as choosing a time.
CREATE OR REPLACE VIEW v_booking_funnel AS
SELECT date_trunc('week', l.created_at)::date          AS week,
       count(*)                                        AS leads,
       count(a.appointment_id)                         AS booked,
       round(100.0 * count(a.appointment_id)
             / nullif(count(*), 0), 1)                 AS book_rate_pct
FROM leads l
LEFT JOIN appointments a ON a.lead_id = l.lead_id AND a.status = 'booked'
GROUP BY 1
ORDER BY 1 DESC;
