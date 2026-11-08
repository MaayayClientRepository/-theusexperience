import site from './site.js';

/**
 * WELCOME TO KARUR (#karur), words & data for the town guide.
 * ALL OF THIS IS DUMMY / from general knowledge: the couple should verify every line marked VERIFY.
 * Distances are rough straight-line / road estimates FROM THE VENUE (site.wedding.venue) and are labelled "approx." in the UI.
 * `bearing` is only used to place a place around the venue on the abstract diagram (0 = north, 90 = east, clockwise). It is decorative.
 */
export default {
  head: {
    eyebrow: 'Where it happens',
    title: ['Welcome to ', 'Karur'],
    lead: 'A little guide to the town hosting you. Star the places you’d want to explore!',
  },

  /* ---------- the four tiles on the section screen (one-line descriptors; chips are built from the data below) ---------- */
  tiles: {
    glance: 'The river, the trade and the old name.',
    sights: 'Temples, river walks and hill stations.',
    eat: 'Meals, coffee and textiles.',
    trips: 'Easy days out from town.',
  },

  /* ---------- (a) Karur at a glance ---------- */
  glance: {
    label: 'Karur at a glance',
    // VERIFY every fact here. Wording is deliberately hedged.
    lead: 'A river town in the heart of Tamil Nadu: calm, hard-working, and very proud of its cloth.',
    paragraph: 'Karur sits on the banks of the Amaravathi river, in the middle of the state. It is best known today for textiles and home furnishings, and for the bus-body builders who have quietly put bodies on a great many of the state’s buses. Its roots are far older. Ancient Tamil literature mentions a place called Karuvur, often linked with the early Chera kings.',
    story: [
      { h: 'The river', p: 'The Amaravathi joins the Cauvery close to Karur. Locals tend to treat its banks as the town’s living room: morning walks, evening conversations, and the occasional wedding photo.' },            // VERIFY
      { h: 'The old name', p: 'Classical Tamil texts mention Karuvur, and many historians associate it with the Chera dynasty. Details are debated, so we will not pretend to settle that argument between the soup and the sweet.' },   // VERIFY
      { h: 'The trade', p: 'Karur is widely known as a hub for home textiles (bed linen, towels, curtains and table linen), and for building bus bodies. If you spot a gleaming bus on your travels, there is a fair chance it was dressed here.' },  // VERIFY
      { h: 'The pace', p: 'Smaller than the big cities, friendlier than most. Shops tend to close for a mid-afternoon rest, and the best meals are usually at lunch.' },                                                                   // VERIFY
    ],
    facts: [
      ['District', 'Karur, Tamil Nadu'],
      ['Language', 'Tamil (English is widely understood in shops and hotels)'],
      ['Nov weather', 'Pleasant, ~30°C by afternoon; showers possible'],
      ['Nearest rail', 'Karur Junction'],
    ],
  },

  /* ---------- (b) Sights & getaways ---------- */
  // km = rough distance from the venue. VERIFY every entry (names, spellings, distances, directions).
  sights: [
    { id: 'pasupatheeswarar', name: 'Sri Kalyana Pasupatheeswarar Temple', short: 'Pasupatheeswarar', kind: 'Temple', km: 2, bearing: 215,
      why: 'The town’s best-known Shiva temple, with tall gopurams and a long history. A fitting stop before a wedding.', q: 'Kalyana Pasupatheeswarar Temple, Karur' },
    { id: 'amaravathi', name: 'Amaravathi river banks', short: 'Riverbank', kind: 'River', km: 4, bearing: 110,
      why: 'A quiet evening walk by the water, with long views and easy conversation.', q: 'Amaravathi River, Karur' },
    { id: 'mayanur', name: 'Mayanur & Kulithalai area', short: 'Mayanur', kind: 'River', km: 32, bearing: 135,
      why: 'Cauvery barrage country: green fields, open skies, and a few old temples in the Kulithalai area.', q: 'Mayanur Barrage, Karur' },
    { id: 'kolli', name: 'Kolli Hills', short: 'Kolli Hills', kind: 'Hill station', km: 90, bearing: 40,
      why: 'Cool, quiet hills reached by 70 hairpin bends. Waterfalls, forest air and not many crowds. About 2 hr 30 min by road.', q: 'Kolli Hills, Tamil Nadu' },
    { id: 'yercaud', name: 'Yercaud', short: 'Yercaud', kind: 'Hill station', km: 135, bearing: 5,
      why: 'A small, relaxed hill station with coffee estates and a lake. Easy for a weekend. About 3 hr by road.', q: 'Yercaud, Tamil Nadu' },
    { id: 'kodaikanal', name: 'Kodaikanal', short: 'Kodaikanal', kind: 'Hill station', km: 150, bearing: 200,
      why: 'Misty lake, pine forests and cool evenings. About 3 hr 30 min by road.', q: 'Kodaikanal, Tamil Nadu' },
    { id: 'ooty', name: 'Ooty (Udhagamandalam)', short: 'Ooty', kind: 'Hill station', km: 220, bearing: 285,
      why: 'The classic Nilgiris hill station: tea gardens, the toy train and botanical gardens. About 5 hr by road.', q: 'Ooty, Tamil Nadu' },
    { id: 'kolukkumalai', name: 'Kolukkumalai Tea Estate', short: 'Kolukkumalai', kind: 'Tea estate', km: 250, bearing: 240,
      why: 'One of the highest tea estates in the world, above the clouds near Munnar. Sunrise jeep rides are the thing to do. About 6 hr by road; plan an overnight.', q: 'Kolukkumalai Tea Estate' },
  ],

  /* ---------- (c) Eat & shop ---------- */
  eat: {
    items: [
      { id: 'meals', short: 'Meals', icon: 'utensils', name: 'A proper “meals” on a banana leaf', text: 'Local restaurants serve full vegetarian meals at lunch: rice, sambar, rasam, curd and a rotating cast of poriyals. Ask for the day’s special.', tip: 'Lunchtime is the high point. Dinner is lighter.' },              // VERIFY
      { id: 'kongu', short: 'Kongu flavours', icon: 'soup', name: 'Kongu-region flavours', text: 'Karur sits in the Kongu belt, known for hearty, gently spiced food. Look for dishes with coconut, shallots and freshly ground masalas.', tip: 'If it is on a hand-written board, order it.' },                // VERIFY
      { id: 'coffee', short: 'Filter coffee', icon: 'coffee', name: 'Filter coffee', text: 'Strong, frothy, served in a steel tumbler and dabara. It is not optional.', tip: 'Ask for “strong” if you mean it; ask for “less sugar” if you are brave.' },
      { id: 'textiles', short: 'Textiles', icon: 'shopping-bag', name: 'Home textiles', text: 'Karur is widely known for bed linen, towels, curtains and table linen. Local showrooms are the place for a good bargain on things you did not know you needed.', tip: 'Shops tend to rest between about 1:30 and 4 PM. Plan accordingly.' },   // VERIFY
      { id: 'sweets', short: 'Sweets', icon: 'cake', name: 'Sweets & snacks', text: 'Small sweet shops near the bus stand are good for take-home boxes of mixture, murukku and halwa.', tip: 'Buy more than you think. They disappear on the train.' },        // VERIFY
    ],
  },

  /* ---------- (d) Day trips ---------- */
  // km / time from Karur. VERIFY all.
  trips: [
    { id: 'trichy', name: 'Tiruchirappalli', sub: 'Srirangam & Rockfort', km: 80, time: '1 hr 45 min', bearing: 120,
      why: 'The great Ranganathaswamy temple at Srirangam and the Rockfort temple on its rock. One long, rewarding day.', q: 'Srirangam Ranganathaswamy Temple' },
    { id: 'kodumudi', name: 'Kodumudi', sub: 'Cauvery & the Magudeswarar temple', km: 45, time: '1 hr 10 min', bearing: 290,
      why: 'A quiet temple town on the Cauvery, a gentle day out.', q: 'Kodumudi Magudeswarar Temple' },
    { id: 'erode', name: 'Erode', sub: 'Textiles & turmeric', km: 65, time: '1 hr 30 min', bearing: 300,
      why: 'A busy market city known for textiles and turmeric. Good for shoppers.', q: 'Erode, Tamil Nadu' },
    { id: 'palani', name: 'Palani', sub: 'Murugan hill temple', km: 100, time: '2 hr 15 min', bearing: 250,
      why: 'A major hill temple to Lord Murugan. Start early; the steps (or the winch) are worth it.', q: 'Palani Murugan Temple' },
    { id: 'madurai', name: 'Madurai', sub: 'Meenakshi Amman Temple', km: 140, time: '3 hr', bearing: 190,
      why: 'The great Meenakshi temple and some of the best food in the south. A long day; consider an overnight.', q: 'Meenakshi Amman Temple, Madurai' },
  ],

  plan: {
    title: 'My Karur plan',
    empty: 'Nothing saved yet. Tap the star on any place to add it here.',
    shareIntro: 'My Karur plan for the wedding:',
  },
};
