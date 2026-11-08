import site from './site.js';
/**
 * HOME (landing) copy. Names and dates come from content/site.js, so there is nothing to retype here.
 */
export default {
  eyebrow: 'And life brought us here!',
  place: site.wedding.city,
  greeting: (name) => `For ${name}`,   // shown when the link has ?to=Name
  cta: { primary: 'See the wedding', rsvp: 'RSVP', save: 'Save the date' },
  tamilLine: 'உங்கள் வருகை எங்கள் மகிழ்ச்சி',   // "Your presence is our joy" (from the website copy doc; not shown yet: no slot on the page)
  labels: { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' },

  after: { label: 'Married' },
};
