/**
 * SITE-WIDE ESSENTIALS (v2 · "Aurora"). Start here when personalising.
 * Every other content file imports this one, so a name or date changed here updates the whole site.
 * Times are ISO strings with the +05:30 (IST) offset so countdowns and calendar files are right everywhere.
 * ALL OF THIS IS DUMMY CONTENT: replace it with the real details.
 */
const site = {
  couple: {
    bride: { first: 'Nivitha', full: 'Nivitha', nick: 'Veevee' },
    groom: { first: 'Prem', full: 'Prem', nick: 'Vivi' },
    monogram: 'P·N',
    hashtag: '#PremWedsNivitha',
    // Display order wherever the two names appear together (hero, door, footer, share texts).
    // Default: Prem & Nivitha. Swap the two entries to flip it.
    pair: null,   // filled in just below
  },

  wedding: {
    muhurtham: '2026-11-20T08:15:00+05:30',   // the countdown target (Subha Muhurtham, 8:15 AM)
    dateLabel: '19 & 20 November 2026',
    shortDate: '19·20.11.26',
    city: 'Karur',
    state: 'Tamil Nadu',
    timezone: 'Asia/Kolkata',
    days: [
      { id: 'day1', date: '2026-11-19', label: 'Day One', weekday: 'Thursday', theme: 'Nichayathartham, Muhurthakkal, Inaicheer & Reception' },
      { id: 'day2', date: '2026-11-20', label: 'Day Two', weekday: 'Friday', theme: 'Subha Muhurtham & Lunch' },
    ],
    venue: {
      name: 'Prem Mahal',
      area: 'Karur, Tamil Nadu',
      address: 'Prem Mahal, Karur, Tamil Nadu',   // TODO: add street + PIN once confirmed
      mapsUrl: 'https://maps.app.goo.gl/iyp6xTXr1htXqJd48',
      lat: 10.9643146,   // Prem Mahal Marriage Hall (from the shared Maps link)
      lng: 78.0618008,
    },
  },

  /**
   * The canonical schedule: the Wedding bento, calendar files and the RSVP all read this list.
   * kind: 'haldi' | 'ring' | 'music' | 'mandapam' | 'feast' | 'party'
   */
  events: [
    { id: 'nichayathartham', day: 'day1', kind: 'ring', name: 'Nichayathartham', tamil: 'நிச்சயதார்த்தம்',
      start: '2026-11-19T10:00:00+05:30', end: '2026-11-19T11:00:00+05:30', place: 'Prem Mahal', dress: 'Silks welcome',
      blurb: 'The celebrations begin. Two families, one promise, made official.' },
    { id: 'muhurthakkal', day: 'day1', kind: 'mandapam', name: 'Muhurthakkal', tamil: 'முகூர்த்தக்கால்',
      start: '2026-11-19T11:45:00+05:30', end: '2026-11-19T12:45:00+05:30', place: 'Prem Mahal', dress: 'Traditional',
      blurb: 'An auspicious first step for everything that follows.' },
    { id: 'lunch1', day: 'day1', kind: 'feast', name: 'Lunch', tamil: 'மதிய விருந்து',
      start: '2026-11-19T13:00:00+05:30', end: '2026-11-19T14:00:00+05:30', place: 'Prem Mahal', dress: 'Anything with an elastic waistband',
      blurb: 'Come hungry. This is the first of two lunches.' },
    { id: 'inaicheer', day: 'day1', kind: 'ring', name: 'Inaicheer', tamil: 'இணைச்சீர்',
      start: '2026-11-19T15:00:00+05:30', end: '2026-11-19T16:00:00+05:30', place: 'Prem Mahal', dress: 'Silks welcome',
      blurb: 'A ceremony for the two families.' },   // TODO: a more specific line once the couple describe Inaicheer
    { id: 'reception', day: 'day1', kind: 'party', name: 'Reception', tamil: 'வரவேற்பு',
      start: '2026-11-19T18:00:00+05:30', end: '2026-11-19T21:00:00+05:30', place: 'Prem Mahal', dress: 'Indo-western',
      blurb: 'The evening we celebrate with everyone we love.' },
    { id: 'muhurtham', day: 'day2', kind: 'mandapam', name: 'Subha Muhurtham', tamil: 'சுபமுகூர்த்தம்',
      start: '2026-11-20T08:15:00+05:30', end: '2026-11-20T09:15:00+05:30', place: 'Prem Mahal', dress: 'Traditional: silks & veshtis',
      blurb: 'The wedding itself. Please arrive a little early.' },
    { id: 'lunch2', day: 'day2', kind: 'feast', name: 'Lunch', tamil: 'மதிய விருந்து',
      start: '2026-11-20T12:30:00+05:30', end: '2026-11-20T13:30:00+05:30', place: 'Prem Mahal', dress: 'Anything with an elastic waistband',
      blurb: 'The second lunch. We did say come hungry.' },
  ],

  contact: {
    phone: '+91 85261 28727',
    whatsapp: '918526128727',   // digits only, country code included (used for wa.me links)
    email: 'premmerp21@gmail.com',
    coordinators: [
      { name: 'Divya', role: 'Bride’s cousin · logistics', phone: '+91 90000 11111' },
      { name: 'Rahul', role: 'Groom’s best friend · on call', phone: '+91 90000 22222' },
    ],
  },

  usePlaceholders: false,   // false once real photos are in assets/photos/
  siteUrl: '',             // set after deploying (used by the share button)
};

// Names in display order (groom first by default). Swap to change the order everywhere.
site.couple.pair = [site.couple.groom, site.couple.bride];

export default site;
