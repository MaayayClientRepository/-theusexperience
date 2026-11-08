/**
 * THE NUMBERS OF US · content (the couple's own answer key).
 * No exact figures: every question is answered on one ordered scale, `scale` below (Less → Infinity).
 *   q: the question · answer: the index of the right scale step (0 = first step).
 *   note (optional): one line shown after the reveal.
 * Scoring: the right step is full marks, one step away is partial credit. 10 of these are played per round.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  intro: 'Guess how much, how many, how long. No exact numbers, just the right range.',
  rounds: 10,
  // Ordered low to high. `glyph` is the big symbol on the button.
  scale: [
    { id: 'less', label: 'Less', glyph: '·' },
    { id: 'moderate', label: 'Moderate', glyph: '··' },
    { id: 'many', label: 'Many', glyph: '···' },
    { id: 'infinity', label: 'Infinity', glyph: '∞' },
  ],
  points: { exact: 100, near: 40 },   // exact step / one step away
  questions: [
    { q: `How many alarms does ${b} need before getting out of bed?`, answer: 1 },
    { q: `How often does ${b} double-check for his phone, wallet and keys before leaving?`, answer: 0 },
    { q: `How many photographs does ${a} take before settling on one?`, answer: 2 },
    { q: `How much can ${b} talk about an adventure once he gets started?`, answer: 3 },
    { q: `How many times does ${a} change her mind before deciding what to eat?`, answer: 1 },
    { q: `How many browser tabs does ${b} typically have open?`, answer: 2 },
    { q: `How much black coffee does ${a} need on a busy day?`, answer: 1 },
    { q: 'How long before someone starts asking questions about the actors during a movie?', answer: 0 },
    { q: 'How long can either of them stay silent after a disagreement?', answer: 0 },
    { q: 'How many food options do they consider before ordering?', answer: 2 },
    { q: `How often does ${b} forget where he’s kept something?`, answer: 2 },
    { q: `How much checking does ${a} do before leaving to make sure everything is in place?`, answer: 2 },
    { q: 'How long into a road trip before someone asks, “Are we there yet?”', answer: 1 },
    { q: `How quickly can ${b} turn a simple outing into an adventure plan?`, answer: 0 },
    { q: `How many things can ${a} juggle while still noticing everything around her?`, answer: 2 },
    { q: `How long does ${b} need to get ready for a spontaneous adventure?`, answer: 0 },
    { q: `How long would ${b} happily spend exploring a forest?`, answer: 3 },
    { q: `How long does ${a} take to get ready for a special occasion?`, answer: 1 },
    { q: `How long can ${b} go without noticing he’s hungry when he’s absorbed in something interesting?`, answer: 2 },
    { q: 'How long does a supposedly quick dinner decision actually take?', answer: 2 },
  ],
  verdicts: { exact: 'Spot on', near: 'One step off', far: 'Way off' },
  // by share of the maximum points (highest first)
  tiers: [
    { min: .8, title: 'The couple’s accountant', line: 'You know the numbers better than the couple does. Please do the seating chart.' },
    { min: .6, title: 'Strong instincts', line: 'You have clearly been at the table when the stories were told.' },
    { min: .4, title: 'Well-meaning guess-timator', line: 'Some figures were close. Some were from another universe. All were committed.' },
    { min: 0, title: 'Here for the biryani', line: 'Numbers were never the point. The food, though, you called correctly.' },
  ],
  share: (score, total, title) => `I scored ${score}/${total} on “The Numbers of Us” for ${a} & ${b}: ${title}. Beat me? `,
};
