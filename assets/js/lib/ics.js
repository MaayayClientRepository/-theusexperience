/**
 * KALYANAM · ics — "Add to calendar" without a backend.
 *
 *   downloadICS(site.events, 'ananya-arjun-wedding.ics')   // every event (or pass nothing at all)
 *   downloadICS('muhurtham')                                // one event — by id or by object
 *   googleCalendarUrl(ev)                                   // https://calendar.google.com/calendar/render?action=TEMPLATE…
 *   icsText(evOrEvs, { calName, alarm })                    // the raw RFC 5545 text
 *
 * An event is an item of site.events: { id, name, subtitle?, start: ISO, end: ISO, place, dress?, blurb? }.
 * Times are read from the ISO strings in content/site.js (with their +05:30 offset) and written in UTC,
 * so every calendar shows them correctly in the guest's own timezone.
 *
 * Output: CRLF line endings, lines folded at 75 octets (UTF-8 safe), TEXT values escaped (\ ; , newlines).
 * UID = "<event id>.<bride>-<groom>@kalyanam" — stable, so re-importing updates instead of duplicating.
 * Each event carries a 60-minute reminder by default (alarm: false to omit; any number = minutes before).
 * This module has no DOM dependencies except downloadICS(), so icsText() also runs in Node for tests.
 */
import site from '../../../content/site.js';

const CRLF = '\r\n';

const couple = () => {
  const c = site.couple || {};
  return { bride: c.bride?.first || 'Bride', groom: c.groom?.first || 'Groom' };
};
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '') || 'x';

/** Accepts an event object, an event id, an array of either, or nothing (= every event). */
function toList(evOrEvs) {
  const all = Array.isArray(site.events) ? site.events : [];
  if (evOrEvs == null) return all;
  const find = (e) => (typeof e === 'string' ? all.find((x) => x.id === e) : e);
  return (Array.isArray(evOrEvs) ? evOrEvs : [evOrEvs]).map(find).filter((e) => e && typeof e === 'object');
}
function parseDate(v) {
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}
/** { start, end } as Dates; end defaults to start + 1h (and is never before start). */
function span(ev) {
  const start = parseDate(ev.start);
  if (!start) return null;
  let end = parseDate(ev.end);
  if (!end || end <= start) end = new Date(start.getTime() + 3600000);
  return { start, end };
}
/** 2027-02-13T07:30:00+05:30 → 20270213T020000Z */
const utcStamp = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[-:]/g, '');

/** "Muhurtham · Ananya & Arjun's wedding" */
export function eventTitle(ev) {
  const { bride, groom } = couple();
  return `${ev.name || 'Celebration'} · ${bride} & ${groom}'s wedding`;
}
/** "<place>, <venue name>, <address>" (repeats dropped, e.g. when the place *is* the venue). */
export function eventLocation(ev) {
  const v = site.wedding?.venue || {};
  const parts = [ev.place, v.name, v.address].map((p) => String(p ?? '').trim()).filter(Boolean);
  return parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i).join(', ');
}
/** Blurb (with subtitle) + dress code + map + site link, as plain text with blank lines between. */
export function eventDetails(ev) {
  const blocks = [];
  const lead = [ev.subtitle ? `${String(ev.subtitle).replace(/[.\s]+$/, '')}.` : '', ev.blurb || ''].filter(Boolean).join(' ');
  if (lead) blocks.push(lead);
  if (site.wedding?.venue?.mapsUrl) blocks.push(`Map: ${site.wedding.venue.mapsUrl}`);
  if (site.siteUrl) blocks.push(`Details & RSVP: ${site.siteUrl}`);
  return blocks.join('\n\n');
}

/** RFC 5545 TEXT escaping. */
const escText = (s) => String(s ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,')
  .replace(/\r\n|\r|\n/g, '\\n');

/** Fold a content line to ≤ 75 octets per physical line (continuations start with one space). */
function fold(line) {
  let out = '', cur = '', bytes = 0;
  for (const ch of line) {                        // iterates by code point: never splits a UTF-8 sequence
    const cp = ch.codePointAt(0);
    const b = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    if (bytes + b > 75) { out += cur + CRLF + ' '; cur = ''; bytes = 1; }
    cur += ch;
    bytes += b;
  }
  return out + cur;
}

/** The .ics text for one event, an id, an array, or (no argument) the whole schedule. */
export function icsText(eventOrEvents, { calName = 'Kalyanam', alarm = 60 } = {}) {
  const list = toList(eventOrEvents);
  const { bride, groom } = couple();
  const uidTail = `${slug(bride)}-${slug(groom)}@kalyanam`;
  const stamp = utcStamp(new Date());
  const venue = site.wedding?.venue || {};
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kalyanam//Wedding website//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escText(calName)}`,
  ];
  list.forEach((ev, i) => {
    const s = span(ev);
    if (!s) return;
    const title = eventTitle(ev);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${slug(ev.id || `event-${i + 1}`)}.${uidTail}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(s.start)}`,
      `DTEND:${utcStamp(s.end)}`,
      `SUMMARY:${escText(title)}`,
      `LOCATION:${escText(eventLocation(ev))}`,
      `DESCRIPTION:${escText(eventDetails(ev))}`,
    );
    if (Number.isFinite(venue.lat) && Number.isFinite(venue.lng)) lines.push(`GEO:${venue.lat};${venue.lng}`);
    if (site.siteUrl) lines.push(`URL:${site.siteUrl}`);
    lines.push('STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'SEQUENCE:0');
    const minutes = Math.round(Number(alarm));
    if (alarm !== false && minutes > 0) {
      lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escText(title)}`, `TRIGGER:-PT${minutes}M`, 'END:VALARM');
    }
    lines.push('END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.map(fold).join(CRLF) + CRLF;
}

/**
 * Save an .ics file (Blob + a[download]). On iOS Safari the file opens straight into Calendar.
 * Returns true if the download was started.
 */
export function downloadICS(eventOrEvents, filename = 'kalyanam.ics') {
  if (typeof document === 'undefined') return false;
  let name = String(filename || 'kalyanam.ics').replace(/[\\/:*?"<>|\u0000-\u001F]+/g, '-').trim() || 'kalyanam';
  if (!/\.ics$/i.test(name)) name += '.ics';
  try {
    const blob = new Blob([icsText(eventOrEvents)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);   // revoking early breaks some mobile downloads
    return true;
  } catch (err) {
    console.error('[kalyanam] calendar download failed', err);
    return false;
  }
}

/** Google Calendar "add event" link for one event (object or id). Returns '#' for an unknown event. */
export function googleCalendarUrl(event) {
  const ev = toList(event)[0];
  const s = ev && span(ev);
  if (!s) return '#';
  const q = [
    'action=TEMPLATE',
    `text=${encodeURIComponent(eventTitle(ev))}`,
    `dates=${utcStamp(s.start)}/${utcStamp(s.end)}`,
    `details=${encodeURIComponent(eventDetails(ev))}`,
    `location=${encodeURIComponent(eventLocation(ev))}`,
    `ctz=${encodeURIComponent(site.wedding?.timezone || 'Asia/Kolkata')}`,
  ];
  return `https://calendar.google.com/calendar/render?${q.join('&')}`;
}

/** Outlook.com "add event" link (bonus). */
export function outlookCalendarUrl(event) {
  const ev = toList(event)[0];
  const s = ev && span(ev);
  if (!s) return '#';
  const iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const q = [
    'path=%2Fcalendar%2Faction%2Fcompose',
    'rru=addevent',
    `subject=${encodeURIComponent(eventTitle(ev))}`,
    `startdt=${encodeURIComponent(iso(s.start))}`,
    `enddt=${encodeURIComponent(iso(s.end))}`,
    `body=${encodeURIComponent(eventDetails(ev))}`,
    `location=${encodeURIComponent(eventLocation(ev))}`,
  ];
  return `https://outlook.live.com/calendar/0/action/compose?${q.join('&')}`;
}
