/**
 * TWO TRUTHS & A FIB · content (the couple's own answer key).
 * Each item is one round: `title` is the round's heading, two `truths`, one `fib`.
 * `why` (optional) is a line revealed after the guess. The game shuffles the order of the items and the position of the fib.
 * Keep every line to one short sentence. All 10 are played per round.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  rounds: 10,
  intro: 'Three claims. One is a fib. Trust your gut, or your memory of the couple.',
  items: [
    { title: 'Planning a Holiday',
      truths: [`${b} can turn a relaxing holiday into an itinerary full of activities.`, `${a} is usually the one who makes sure the practical details are sorted.`],
      fib: 'Given the choice, both would happily spend an entire holiday doing absolutely nothing.' },
    { title: 'A Simple Dinner Decision',
      truths: [`${a} can be particular about what she wants to eat.`, `${b} is usually happy to experiment with something new.`],
      fib: 'They can settle on what to eat in under thirty seconds, every single time.' },
    { title: 'The Movie Debate',
      truths: ['They sometimes have completely different opinions about a performance.', 'The discussion after the movie can be just as entertaining as the movie itself.'],
      fib: `${b} and ${a} have never disagreed about a movie.` },
    { title: 'The Little Things',
      truths: [`${a} notices details that other people might miss.`, `${b} can get so absorbed in something interesting that everything else takes a back seat.`],
      fib: `${b} is the one who remembers where absolutely everything is kept.` },
    { title: 'The Creative Kitchen',
      truths: [`${a} enjoys experimenting with recipes rather than always following them exactly.`, 'A dosa is one of her favorite things to make.'],
      fib: `${a} considers cooking a task best left entirely to professionals.` },
    { title: 'Personal Preferences',
      truths: [`${a} has a particular soft spot for freshly done nails.`, 'Strong black coffee is her kind of coffee.'],
      fib: `${b} is the one who gets excited about different shades of white.` },
    { title: 'Sleep Schedules',
      truths: [`${b} is a proper night owl.`, `${a} prefers turning in earlier.`],
      fib: 'Both are equally enthusiastic about staying up until sunrise.' },
    { title: 'The Great Outdoors',
      truths: [`${b} would happily trade a luxury holiday for a few days exploring the wilderness.`, `${b} has a soft spot for pretty much every creature, including the ones most people would avoid.`],
      fib: `${b} prefers holidays where absolutely nothing involves getting his hands dirty.` },
    { title: 'The Household Department',
      truths: [`${b} is usually the first person to volunteer when something around the house needs fixing.`, `If something goes wrong with the plumbing or electricity, ${b} is happy to investigate it himself.`],
      fib: `${b} believes keeping things tidy is essential to being productive.` },
    { title: 'The Weekend Edition',
      truths: [`${b} can turn a quiet weekend into an adventure without much planning.`, `${a} enjoys spending a slow afternoon painting, reading or making something by hand.`],
      fib: `Given a free weekend, ${b} would happily spend both days catching up on sleep and doing nothing.` },
  ],
  // by number of fibs caught (out of `rounds`, highest first)
  tiers: [
    { min: 9, title: 'Human polygraph', line: 'Hardly a fib got past you. The aunties would like to hire you for interrogations.' },
    { min: 7, title: 'Sharp ear', line: 'You listen when the stories are told. It shows.' },
    { min: 4, title: 'Easily charmed', line: 'Believes everything at weddings. A wonderful guest, a risky juror.' },
    { min: 0, title: 'Fully fooled', line: 'The couple would like to thank you for your trust, and the biryani for your attention.' },
  ],
  share: (score, total, title) => `I spotted ${score}/${total} fibs about ${a} & ${b}: ${title}. Can you beat me? `,
};
