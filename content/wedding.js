import site from './site.js';

/**
 * THE WEDDING (#wedding), words & data for the bento box.
 * Events, venue, dates and coordinators live in content/site.js (never repeated here).
 * Everything below is DUMMY / approximate: the couple should verify every number marked VERIFY.
 */
export default {
  head: {
    eyebrow: 'The Wedding · 19 & 20 Nov 2026',
    title: ['Two days. Seven moments. ', 'One ', 'long', ' celebration.'],   // rendered: Two days. Seven moments. One <em>long</em> celebration.
    lead: '',
  },

  dateNote: 'Our celebrations may follow familiar traditions, but we want every part of them to mean something to us. More than anything, we hope you leave remembering what brought us here in the first place. Love.',

  /* Extra per-event data, keyed by the event ids in site.events. */
  eventExtras: {
    nichayathartham: { swatch: ['#B5415A', '#E3C26E'], palette: 'Silk sarees and silk veshtis, jewel tones, a little zari.' },
    muhurthakkal:    { swatch: ['#8F2F3C', '#E3C26E'], palette: 'Traditional: silks and veshtis. Maroon, mustard, ivory.' },
    lunch1:          { swatch: ['#F5ECD2', '#7A9B64'], palette: 'Whatever you wore this morning, loosened by one notch.' },
    inaicheer:       { swatch: ['#B5415A', '#E3C26E'], palette: 'Silk sarees and silk veshtis, jewel tones, a little zari.' },
    reception:       { swatch: ['#1B2540', '#E3C26E'], palette: 'Indo-western: sherwanis, gowns, lehengas, sarees with a twist. Midnight blue and gold are on trend.' },
    muhurtham:       { swatch: ['#8F2F3C', '#E3C26E'], palette: 'Traditional: kanjeevaram silks, veshtis, angavastram. Maroon, mustard, emerald, ivory.' },
    lunch2:          { swatch: ['#F5ECD2', '#7A9B64'], palette: 'Whatever you wore at the muhurtham, but loosened by one notch.' },
  },

  dress: {
    title: 'What to wear',
    lead: 'Each event has its own mood. Here is the whole wardrobe, in order.',
    // simple palette guidance (no cartoon outfits, just good advice)
    women: [
      'Day events: silk sarees, half-sarees, salwars in warm, saturated colours.',
      'Evening: lighter fabrics, pastels or jewel tones, embellishment welcome.',
      'Comfortable footwear. The lawn is grass and the mandapam is marble.',
    ],
    men: [
      'Muhurtham: veshti and angavastram, or a silk kurta with a dhoti.',
      'Evening: bandhgala, sherwani or a sharp blazer over a kurta.',
      'Footwear is removed before the mandapam. Wear socks you are proud of.',
    ],
    avoid: 'Please skip: all-white (reserved for the couple’s mood boards) and black at the muhurtham.',
  },

  /* ---------- Location ---------- */
  travel: {
    nearestStation: { name: 'Karur Junction (KRR)', note: '~3 km from the venue, about 10 minutes by auto.' },   // VERIFY
    busStand: { name: 'Karur Bus Stand', note: 'Frequent state and private buses run to Karur from all over Tamil Nadu. The venue is a short auto ride from the bus stand.' },   // VERIFY distance
    approxNote: 'Distances and times are approximate (dummy figures). Please double-check on a maps app before you travel.',
    // One entry per origin. DUMMY: VERIFY every number.
    from: [
      { city: 'Chennai', km: 390, road: '~6 hr 30 min', roadTip: 'Via Tiruchirappalli on NH 38 (Chennai–Trichy–Karur). Leave before 6 AM to dodge city traffic.',
        train: 'Overnight to Tiruchirappalli or Karur Junction (connections vary); check the Trichy–Karur local.', bus: 'Overnight buses to Karur run from Koyambedu; a sleeper is the easy way to arrive rested.', tip: 'The overnight bus is the classic: sleep through the road, arrive for filter coffee.' },
      { city: 'Coimbatore', km: 120, road: '~2 hr 45 min', roadTip: 'Via Avinashi–Tiruppur–Kangeyam–Karur or via Erode; both are straightforward drives.',
        train: 'Coimbatore to Karur Junction by direct and connecting trains (a couple of hours).', bus: 'Frequent buses from Gandhipuram, about 3 hr; no need to book ahead.', tip: 'Frequent state buses leave from Gandhipuram; no need to book ahead.' },
      { city: 'Trichy (Tiruchirappalli)', km: 80, road: '~1 hr 45 min', roadTip: 'Straight run along the Karur–Trichy highway, with a few busy town crossings.',
        train: 'Frequent trains and DEMUs; about 1 hr 30 min.', bus: 'Buses leave Trichy Central every few minutes; about 1 hr 45 min.', tip: 'The easiest way in for most guests: hop on a bus, arrive in time for lunch.' },
      { city: 'Madurai', km: 140, road: '~3 hr', roadTip: 'North via Dindigul, then Karur; the NH is good.',
        train: 'Madurai to Karur Junction via Dindigul; plan around 3 hr.', bus: 'Buses from Mattuthavani via Dindigul; about 3 hr 30 min.', tip: 'Dindigul has a very good biryani stop at the halfway point.' },
      { city: 'Bengaluru', km: 340, road: '~6 hr 30 min', roadTip: 'Via Hosur–Krishnagiri–Salem–Namakkal–Karur. Start early to cross Hosur before the rush.',
        train: 'Overnight trains to Salem or Karur; check current timetable.', bus: 'Overnight buses via Hosur and Salem; about 7 hr. Book a seat ahead.', tip: 'The Salem–Karur stretch is a quiet drive. Podcasts recommended.' },
      { city: 'Salem', km: 100, road: '~2 hr 15 min', roadTip: 'Via Namakkal; a pleasant, mostly four-lane road.',
        train: 'Salem Junction to Karur Junction by direct trains; about 2 hr.', bus: 'Frequent buses via Namakkal; about 2 hr 30 min.', tip: 'Namakkal makes a perfect chai stop on the way.' },
    ],
  },

  /* ---------- Before you go ---------- */
  beforeYouGo: {
    weatherNote: 'November in Karur: pleasant, around 30°C in the afternoon, cooler mornings. The northeast monsoon can bring showers, so carry an umbrella.',   // VERIFY (approximate climate)
    temp: '32°',
    tempLabel: 'afternoon high, approx.',
    carry: ['Sunglasses', 'Light shawl', 'Comfortable shoes', 'Water bottle', 'Phone charger'],
    joke: 'Filter coffee will be provided. Opinions about the decoction will also be provided, free of charge.',
    tips: [
      { icon: 'clock', title: 'Be seated by 7:45 AM', text: 'The Subha Muhurtham is at 8:15 AM on Friday. Please arrive a little early; the stars do not do “fashionably late”.' },
      { icon: 'camera', title: 'Phones away, please', text: 'During the exchange of garlands and the thaali, we will ask everyone to put phones down for ten minutes. Our photographer has it covered.' },
      { icon: 'thermometer-sun', title: 'The weather', text: 'Cool mornings, hot afternoons, pleasant evenings. Wear breathable fabrics, and carry a light shawl for the evening lawn.' },
      { icon: 'coffee', title: 'Coffee, in volume', text: 'The coffee counter opens at 6:30 AM. Arrive early, hold a tumbler, enjoy the moment.' },
      { icon: 'utensils', title: 'Pace yourself', text: 'There are two lunches, one each day. Come hungry both times.' },
      { icon: 'gift', title: 'Gifts', text: 'Your presence is the gift. If you insist, a blessing envelope is lovely and a book is lovelier.' },
    ],
  },

  /* ---------- Contacts ---------- */
  contacts: {
    title: 'Who to call',
    lead: 'If you are lost, late, or loudly hungry, these two people are your people.',
    general: 'General questions',
  },

  /* ---------- Chase the sun ---------- */
  sun: {
    title: 'Chase the sun',
    lead: 'Drag the sun across the day. The schedule will follow it.',
    domain: [5.5, 23.5],                 // hours shown on the arc (5:30 AM to 11:30 PM)
    hint: 'Drag the sun, tap a marker, or use the slider.',
  },
};
