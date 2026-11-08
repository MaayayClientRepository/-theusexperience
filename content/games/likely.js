/**
 * WHO'S MORE LIKELY TO · content (dummy: rewrite these about the real couple).
 * Each prompt completes the sentence "Who's more likely to …".
 *   truth: 'a' (the bride) or 'b' (the groom): the answer the couple agreed on.
 *   quip:  one dry line shown after the guess.
 *   crowd: [votes for bride, votes for groom]: seeded "crowd" so the bar is never empty; real taps add to it on this device.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  prompts: [
    { q: 'forget the muhurtham time', truth: 'b', crowd: [64, 211],
      quip: `${b} has set eleven alarms for 7:30 AM. He trusts none of them.` },
    { q: 'cry first at the wedding', truth: 'b', crowd: [118, 173],
      quip: `${b} has rehearsed a stoic face. Its battery life is about four seconds.` },
    { q: 'reach the mandapam last', truth: 'a', crowd: [236, 71],
      quip: `Tradition, and also three outfit changes. ${a} will be exactly on time for a different time.` },
    { q: 'get lost on the way to Karur', truth: 'b', crowd: [52, 244],
      quip: `${b} does not believe in maps. He believes in a feeling he has about a left turn.` },
    { q: 'finish the last piece of Mysore pak', truth: 'a', crowd: [201, 98],
      quip: `${a} will say she was only “tidying the plate”.` },
    { q: 'start the dance floor at the sangeet', truth: 'a', crowd: [188, 140],
      quip: `${a} has a routine. ${b} has been told his part is “mostly standing”.` },
    { q: 'win an argument about what to watch', truth: 'a', crowd: [230, 57],
      quip: `Not through volume. Through a single raised eyebrow and the remote.` },
    { q: 'apologise first after a fight', truth: 'b', crowd: [96, 187],
      quip: `${b} apologises quickly, thoroughly and, occasionally, before he knows why.` },
    { q: 'be ready to leave on time for anything', truth: 'a', crowd: [159, 142],
      quip: `${a} is ready on time. ${b} is ready on time ... by his own clock.` },
    { q: 'tell the “how we met” story at every dinner', truth: 'b', crowd: [89, 205],
      quip: `${b} tells it better each time. The coffee shop has acquired a violin.` },
  ],
  // Tiers by number of matches with the couple (highest first).
  tiers: [
    { min: 9, title: 'Honorary best man / woman', line: 'You know them better than their own parents. The aunties are worried.' },
    { min: 7, title: 'Inner circle', line: 'You have clearly been at the table when the stories were told.' },
    { min: 5, title: 'Reliable plus-one', line: 'Solid instincts. Needs a few more filter coffees with the couple.' },
    { min: 3, title: 'Distant relative', line: 'You came for the biryani. We respect that.' },
    { min: 0, title: 'Wrong wedding?', line: 'The seating chart would like a word with you.' },
  ],
  share: (score, total, title) => `I scored ${score}/${total} on “Who’s more likely to” for ${a} & ${b}’s wedding: ${title}. Beat me: `,
};
