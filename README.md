# Kalyanam v2 · "Aurora"
A full-screen, orb-of-light wedding site. Static HTML/CSS/JS, no backend, no build step (GitHub Pages ready).
Knock twice to enter → one-screen sections whose cards open into full-screen sheets.

Run: from the PARENT folder `python3 serve.py` (or any static server), then open `/v2/`.
URLs: `?skipdoor=1` skips the door · `?to=Priya` personal greeting + RSVP prefill · `#wedding` deep-links.

Edit copy in `content/*.js` (start with `site.js`: names, dates, Karur venue, schedule, contacts). Games: `content/play.js` + `content/games/*.js`.
Photos: drop files at the paths printed on the placeholders (`assets/photos/<section>/…`), then set `usePlaceholders:false` in `content/site.js`.
RSVP delivery: `content/rsvp.js → submit` (demo | googleSheets | web3forms | formspree); Apps Script in `scripts/rsvp-google-apps-script.gs`.
Footer poem: `content/footer.js → poem` (paste the full Osho poem only if you have the rights).
Verify before sharing: distances and temples marked `VERIFY` in `content/wedding.js`, `karur.js`.

*Built with the Immersive Wedding World skill, developed by Prem Viswanathan.*
