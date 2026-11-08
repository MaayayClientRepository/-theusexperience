# Content pass: "Prem & Nivitha: Wedding Website Copy" → v2 (2026-11-07)

Source: the Claude Doc at https://claude.ai/artifact/MZXVLJ7BiV4C6KDKFPJ7pf (screens 1–21). A backup of the old `content/` folder was taken before editing (session scratchpad).

## 1. What changed

### content/site.js
- Muhurtham / countdown target 07:30 → **20 Nov 2026, 8:15 AM IST**.
- Day themes: Day 1 "Nichayathartham, Muhurthakkal, Inaicheer & Reception"; Day 2 "Subha Muhurtham & Lunch".
- Venue: "Kalyana Mandapam / Near Karur Bus Stand" → **Prem Mahal, Karur, Tamil Nadu**; new `note` ("Shares a name with the groom…").
- Schedule: 6 dummy events → the doc's **7 events** (ids `nichayathartham, muhurthakkal, lunch1, inaicheer, reception, muhurtham, lunch2`) with doc times, one-line blurbs and Tamil names (`tamil`, stored, not shown yet). All at Prem Mahal. The old Haldi/Sangeet/Feast events are gone, so the calendar file and RSVP now carry the real schedule.
- Nicknames: Niv/PV → **Veevee (Nivitha) / Vivi (Prem)**; these are the quotes under their names.

### content/home.js + assets/js/sections/home.js
- Countdown captions replaced by the doc's 5 lines (14+ days, 7–13, 2–6, Thursday, Friday). JS now picks by **IST calendar day** (rows with `date:` win on that day) instead of fractional days.
- New tagline under the names: "Different teams. One very long conversation." (new `tagline` slot, class `hm-tag`).
- Calendar download renamed `ananya-arjun-wedding.ics` → `prem-nivitha-wedding.ics` (home + footer).

### content/story.js (+ assets/js/sections/story.js, story.css)
- Card paragraph, stats (4.5 years · 4 cities · 32 road trips), photo label.
- Long-read opener, closing screen (with the Tamil invitation line).
- Act one: three versions in the doc's words (Prem's stays "still writing"), tags, reliability notes, poll question, **per-vote replies** ("Wise choice. She has the receipts." etc.).
- Act two: **8 timeline cards** from the doc. Act three: **8 captions** (was 6).
- Act four "The math of us": 6 numbers with formulas. Days, full moons (days ÷ 29.53) and meals (days × 2) are computed live; the others are fixed. Tap a figure to reveal its formula (new). Together-clock now counts from 7 Jun 2022.
- JS: decimal counter fix (4.5 no longer rounds to 5), 3-word titles ("The *math* of us"), tap-to-reveal formulas, poll replies.

### content/us.js (+ assets/js/sections/us.js, us.css, lib/icons.js)
- Both profiles rewritten in each other's voice: facts (born dates, known-since, sign), descriptors, 7 Q&A each, 8 moons each, 6 scored categories each (ratings average to 4.2 and 4.5 as in the doc), "People mention" tags, frame captions, then & now tags/captions.
- Dummy facts removed: birthplaces, jobs, friends' reviews, "the other person adds" lines.
- JS: headings now "Asked about Prem", "The review", "Scored by Nivitha", "Prem, in frames"; hero tag row; "Appeals are pending." and People-mention tags rendered; review meta no longer prints a dangling " · ".
- Added 4 icons (wrench, shield, list-checks, hourglass).

### content/wedding.js (+ assets/js/sections/wedding.js)
- Headline "Two days. Seven moments. One long celebration."; lead "Everything you need, in three tiles. Tap any one."
- Dress-code swatches re-keyed to the 7 new event ids.
- Tip "Be seated by 7:15 AM / 7:30" → **"Be seated by 7:45 AM / 8:15 AM"**; feast tip now says there are two lunches.
- Venue tile shows the new `note` line; countdown fallback and sun-clock default 7:30 → 8:15.

### Checks run
All content modules import cleanly; story and couple sheets open with no console errors; verified in the browser pane: countdown line ("One week to go…"), tagline, 7-event list, venue note, nicknames, 4.5 stat, 8 timeline cards, 8 memory cards, 6 math items.
**Not visually verified:** layout of the new elements (tagline, hero tags, formula reveal) and the animated counters, because the browser pane's door overlay covered the page and does not animate while hidden. Please look at these on a phone-width screen.

## 2. Still needs real data (templated or invented)

| Where | What |
|---|---|
| `site.js` contact | phone, WhatsApp, email (`hello@example.com`), coordinators Divya / Rahul |
| `site.js` venue | street address + PIN, real Google Maps link, real lat/lng (currently Karur centre) |
| `site.js` events | per-event dress codes (invented), Inaicheer's description (doc left it general) |
| `site.js` | `siteUrl`, `usePlaceholders` (true until photos exist) |
| `rsvp.js` | reply deadline (12 Nov 2026 is invented), provider is `demo` (replies go nowhere), sample placeholder name, suggested notes |
| `wedding.js` travel | stations, airports, all 6 from-city routes, shuttle, parking, weather, carry list (marked VERIFY) |
| `wedding.js` tips | coffee counter at 6:30 AM, phones-away rule, gifts line, dress guidance: all invented |
| `karur.js` | whole town guide (general knowledge, marked VERIFY): history, sights, food, day trips |
| `story.js` | poll **seed votes** (31/7/22, invented), together-since time of day (midnight guess), Prem's own "how we met" version |
| `footer.js` | Osho line + poem, credit line |
| Fun House games (`content/games/*`, `play.js`) | **contradict the real story**: "Seven years", a cat, Gopal the scooter, Ooty proposal, dishwasher, college-fest coffee, 7:30 AM alarms. Need a rewrite around the real canon (4.5 years, Murugesa the fish, work, road trips) |
| Photos | every placeholder: `assets/photos/story/` (office-hours, long-conversation, official, four-cities, murugesa, road-trips, decision, karur, m1–m8), `assets/photos/us/` (nivitha, prem, *-then, *-now, nivitha-1…6, prem-1…6), plus the OG image |
| `index.html` / README | OG image URL needs to be absolute after deploy; README still describes v1 |

## 3. Doc copy with no place on the site yet

- Three guest calculators (Where do you fit? · How much will you sleep? · The translator), and the "Vivi and Veevee" entry.
- Schedule sheet: live "NEXT UP · … in 13 days" line.
- Tamil line under the RSVP button ("உங்கள் வருகை எங்கள் மகிழ்ச்சி"; stored as `home.tamilLine`) and Tamil event names (stored on each event).
- Portrait captions ("Prem, in his calmest form", "Nivitha, mid-plan").
- Story tile has one photo slot; the doc lists four photo cards.
- Tile 1 "when tapped" sentence; "Travel directions" label already matches.
- Nav labels in the doc (Home · Our story · The couple · Events · Play · Venue · RSVP) differ from the dock (Home · Our Story · The Couple · The Wedding · RSVP · Fun House · Karur).
- Alternative headline options for the events page.
