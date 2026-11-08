/**
 * WHO'S MORE LIKELY TO · content (the couple's own answer key).
 * Each prompt completes the sentence "Who's more likely to …".
 *   truth: 'a' (the bride), 'b' (the groom), 'both' or 'neither': the answer the couple agreed on.
 * Guests choose Nivi, Prem, Both or Neither. 10 of these are played per round.
 */
import site from '../site.js';
const a = 'Nivi', b = site.couple.groom.first;

export default {
  names: { a, b },
  rounds: 10,
  intro: 'Nivi, Prem, both or neither? Pick one, then see what the couple says.',
  prompts: [
    { q: 'say “I’m ready” while still having 20 minutes of work left', truth: 'b' },
    { q: 'open the fridge, stare into it, close it, and open it again', truth: 'b' },
    { q: 'start a story with “You’ll never believe what happened”', truth: 'b' },
    { q: 'turn a five-minute errand into a three-hour outing', truth: 'b' },
    { q: 'say “I’m not hungry” and then eat from the other’s plate', truth: 'both' },
    { q: 'Google a symptom and convince themselves they have something serious', truth: 'a' },
    { q: 'forget why they entered a room', truth: 'b' },
    { q: 'fall asleep halfway through a movie they insisted on watching', truth: 'a' },
    { q: 'take 47 photographs and still not like a single one', truth: 'a' },
    { q: 'say “We’ll leave in five minutes” and mean 45', truth: 'b' },
    { q: 'get personally offended by a bad restaurant recommendation', truth: 'neither' },
    { q: 'turn a minor inconvenience into a full courtroom argument', truth: 'a' },
    { q: 'buy something because it was on sale, despite having absolutely no need for it', truth: 'neither' },
    { q: 'lose their phone while holding it', truth: 'b' },
    { q: 'give directions with complete confidence and be completely wrong', truth: 'b' },
    { q: 'say “I told you so” before the other has finished explaining', truth: 'neither' },
    { q: 'make a simple recipe unnecessarily complicated', truth: 'a' },
    { q: 'start cleaning one thing and end up reorganizing the entire house', truth: 'a' },
    { q: 'plan an entire day down to the last detail', truth: 'a' },
    { q: 'strike up a conversation with a complete stranger', truth: 'b' },
    { q: 'notice a beautiful sky and stop to admire it', truth: 'a' },
    { q: 'get emotionally invested in a movie', truth: 'both' },
    { q: 'have a strong opinion about how something should be done', truth: 'a' },
    { q: 'experiment with a recipe without following it', truth: 'a' },
    { q: 'pack for a trip at the last minute', truth: 'b' },
    { q: 'have a playlist ready for every possible mood', truth: 'a' },
    { q: 'laugh at the wrong moment during a serious conversation', truth: 'a' },
    { q: 'say, “Let’s just see where the day takes us”', truth: 'b' },
  ],
  // Tiers by number of matches with the couple (out of `rounds`, highest first).
  tiers: [
    { min: 9, title: 'Honorary best man / woman', line: 'You know them better than their own parents. The aunties are worried.' },
    { min: 7, title: 'Inner circle', line: 'You have clearly been at the table when the stories were told.' },
    { min: 5, title: 'Reliable plus-one', line: 'Solid instincts. Needs a few more filter coffees with the couple.' },
    { min: 3, title: 'Distant relative', line: 'You came for the biryani. We respect that.' },
    { min: 0, title: 'Wrong wedding?', line: 'The seating chart would like a word with you.' },
  ],
  share: (score, total, title) => `I scored ${score}/${total} on “Who’s more likely to” for ${site.couple.groom.first} & ${site.couple.bride.first}’s wedding: ${title}. Beat me: `,
};
