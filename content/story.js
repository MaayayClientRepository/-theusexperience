import site from './site.js';
const A = site.couple.bride.first, J = site.couple.groom.first;
/**
 * OUR STORY. Copy comes from the "Prem & Nivitha: Wedding Website Copy" doc (screens 2–8).
 *  - card: the condensed tile on the page
 *  - sheet: everything inside the full-screen long-read
 * Photos live in assets/photos/story/<name>.jpg (placeholders print the expected path until you add them).
 * TODO markers = still templated / needs the couple's input.
 */
export default {
  card: {
    eyebrow: 'Chapter one of many',
    title: ['Our', 'story'],           // second word is set in italic gold
    text: `Somewhere between the conversations, movie nights, walks, adventures and all the ordinary days, we've built something that means the world to us. And if there's one thing we both believe, it's this: Love always wins at the end of the day.`,
    cta: 'A little bit about where this all started.',
    stats: [
      { n: 4.5, label: 'years together' },
      { n: 4, label: 'cities lived or worked in' },
      { n: 32, label: 'road trips' },
    ],
    // The doc lists 4 photo cards (Office hours June 2022 · The yes · Road trip number one); the page has one slot.
    photo: { label: 'Prem and Nivitha', file: 'assets/photos/story/cover.jpg' },
  },

  sheet: {
    open: {
      kicker: 'A long-read, in several acts',
      body: [
        'When we finally got talking, Prem had plenty of stories, and Nivitha was always happy to hear them. One conversation led to another, and then another. Years later, we still haven’t run out of things to talk about and we don’t think we ever will.',
        'We’ve explored new places, tried new things, watched far too many movies, and debated them long after the credits rolled. We may do things differently, but that’s part of the fun.',
        'Nivitha keeps things grounded, Prem keeps things interesting, and neither of us is particularly good at letting the other have the last word. There’s always something to laugh about, something new to discover, or some plan that takes an unexpected turn... Honestly, we wouldn’t have it any other way.',
        'Different ways of enjoying the world, but always making room for each other’s.',
      ],
    },

    timeline: {
      eyebrow: 'Act one',
      title: ['The', 'timeline'],
      // No titles. `file` is optional: leave it out and the card is pictureless.
      items: [
        { date: '08 June 2022', text: 'It started today. We absolutely had no idea where this would take us!', file: 'assets/photos/story/t1.jpg' },
        { date: '04 September 2023', text: 'By this point, we knew this was more than just enjoying each other’s company. We were making space for each other in all the big and little parts of life.', file: 'assets/photos/story/t2.jpg' },
        { date: 'Last week of December 2023', text: 'We went from getting to know each other to becoming each other’s person... The realization that this is going to be something special.', file: 'assets/photos/story/t3.jpg' },
        { date: '08 June 2026', text: 'Countless memories in four years, slightly knowing there’s going to be so much to look forward to in a while.', file: 'assets/photos/story/t4.jpg' },
        { date: '28 June 2026', text: 'A promise made in front of our families. One big celebration ahead, and suddenly, the wedding felt very real!', file: 'assets/photos/story/t5.jpg' },
        { date: '20 November 2026', text: 'The day we make it official, say our vows, and take on whatever comes next... Together, as husband and wife.', last: true },
      ],
    },

    memories: {
      eyebrow: 'Act two',
      title: ['The', 'memory rail'],
      sub: 'Drag, scroll, or use the arrow keys. Pictures say it better than we do.',
      items: [
        { label: 'Where it began', cap: 'Exhibit A: where it began.', file: 'assets/photos/story/m1.jpg' },
        { label: 'Road trip', cap: 'Road trip, Prem driving, Tamil film songs on. Detours count.', file: 'assets/photos/story/m2.jpg' },
        { label: 'Who apologised first', cap: 'Who apologised first? Both of us. Both claim it. (There is also an inside joke here. We are not explaining it.)', file: 'assets/photos/story/m4.jpg' },
        { label: 'A calm Sunday', cap: 'A Sunday, planned by Nivitha and started rather later than Prem would like.', file: 'assets/photos/story/m5.jpg' },
        { label: 'Fixing something', cap: 'Prem, fixing something. Again.', file: 'assets/photos/story/m6.jpg' },
        { label: 'The yes', cap: 'The yes, decided together.', file: 'assets/photos/story/m7.jpg' },
        { label: 'Next stop', cap: 'Next stop: Karur.', file: 'assets/photos/story/m8.jpg' },
        { label: 'Memory eight', cap: 'Caption to come.', file: 'assets/photos/story/m12.jpg' },
        { label: 'Memory nine', cap: 'Caption to come.', file: 'assets/photos/story/m9.jpg' },
        { label: 'Memory ten', cap: 'Caption to come.', file: 'assets/photos/story/m10.jpg' },
        { label: 'Memory eleven', cap: 'Caption to come.', file: 'assets/photos/story/m11.jpg' },
      ],
    },

    numbers: {
      eyebrow: 'Act three',
      title: ['The', 'math', 'of us'],
      // the live "together for" clock counts up from this moment (ISO, with the +05:30 offset).
      // TODO: the day is 8 June 2022; the time of day is a guess (midnight), set the real one if you remember it.
      together: { since: '2022-06-08T00:00:00+05:30', label: 'Together for' },
      // n is shown as-is (text or number); numbers count up, symbols like ∞ just appear.
      items: [
        { n: '∞', label: 'Tabs open in Prem’s brain' },
        { n: 2, label: 'Very different definitions of a perfect holiday' },
        { n: '24/7', label: 'Availability for unsolicited opinions' },
        { n: 1, label: 'Person who remembers where things are' },
        { n: '100%', label: 'Confidence in each other’s questionable plans' },
        { n: 'N', label: 'Times a story has been retold' },
        { n: 2, label: 'People who think they’re always right' },
        { n: 1, label: 'Shared calendar, probably managed by Nivitha' },
        { n: 0, label: 'Boring days guaranteed?' },
      ],
    },

    close: {
      line: ['And so,', 'the next', 'chapter.'],
      sub: 'It begins on Thursday morning in Karur and arrives at 8:15 AM on Friday. You are part of the story.',
      invite: 'அன்புடன் அழைக்கிறோம்.',
      cta: 'Meet the couple',
    },
  },
};
