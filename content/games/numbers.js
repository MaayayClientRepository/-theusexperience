/**
 * THE NUMBERS OF US · content (DUMMY figures taken from content/story.js and content/us.js; swap in the real ones).
 * Slide to guess. Scoring is by how close you land, measured against the slider's range (min to max).
 *   q: the question · unit: shown beside the number · min/max/step: slider · answer: the true value · note: one line shown after.
 * 6 of these are played per round.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  intro: 'Guess the numbers behind our story. Closer is better. A bullseye is worth 100.',
  rounds: 6,
  questions: [
    { q: 'How many days since the coffee incident?', unit: 'days', min: 0, max: 4000, step: 5, answer: 2557,
      note: 'One too-sweet coffee at a college fest, and nobody expected it to last the weekend.' },
    { q: 'Cups of coffee shared, roughly?', unit: 'cups', min: 0, max: 3000, step: 10, answer: 1203,
      note: 'Filter coffee. Dark. One sugar. The second cup is never discussed.' },
    { q: 'How many times have we got lost on road trips?', unit: 'times', min: 0, max: 30, step: 1, answer: 11,
      note: `Each time, ${a} blames the map. Each time, ${b} blames a feeling about a left turn.` },
    { q: `How many times has ${a} watched the muhurtham video, to practise not crying?`, unit: 'times', min: 0, max: 100, step: 1, answer: 40,
      note: 'The practice is not going well. The tissues are packed.' },
    { q: `How many minutes early does ${a} arrive, on average?`, unit: 'min early', min: 0, max: 60, step: 1, answer: 20,
      note: `${b} says ten minutes behind. ${a} says twenty. Both are correct, in their own time zones.` },
    { q: 'How long did the engagement lunch run?', unit: 'minutes', min: 0, max: 480, step: 5, answer: 240,
      note: 'Four hours. It covered most of Karur and settled none of the seating.' },
    { q: `Hours does ${b} nap on a perfect Sunday?`, unit: 'hours', min: 0, max: 8, step: .5, answer: 3,
      note: 'He calls it “a rest”. The cricket is on mute. The cat has the good cushion.' },
  ],
  // by distance from the answer as a share of the slider range
  verdicts: [
    { within: .01, title: 'Bullseye' },
    { within: .05, title: 'So close' },
    { within: .15, title: 'In the neighbourhood' },
    { within: .3, title: 'Wandering' },
    { within: 9, title: 'Different postcode' },
  ],
  tiers: [
    { min: .8, title: 'The couple’s accountant', line: 'You know the numbers better than the couple does. Please do the seating chart.' },
    { min: .6, title: 'Strong instincts', line: 'You have clearly been at the table when the stories were told.' },
    { min: .4, title: 'Well-meaning guess-timator', line: 'Some figures were close. Some were from another universe. All were committed.' },
    { min: 0, title: 'Here for the biryani', line: 'Numbers were never the point. The food, though, you called correctly.' },
  ],
  share: (score, total, title) => `I scored ${score}/${total} on “The Numbers of Us” for ${a} & ${b}: ${title}. Beat me? `,
};
