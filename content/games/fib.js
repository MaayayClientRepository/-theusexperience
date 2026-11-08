/**
 * TWO TRUTHS & A FIB · content (all DUMMY, built from the couple's own sheets in content/us.js and content/story.js; swap in the real ones).
 * Each item is one round: `who` is 'a' (bride), 'b' (groom) or 'both'. Two `truths`, one `fib`, and `why` (revealed after the guess).
 * Keep every line to one short sentence. The game shuffles the order of items and the position of the fib. 6 of these are played per round.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  rounds: 6,
  intro: 'Three claims. One is a fib. Trust your gut, or your memory of the couple.',
  items: [
    { who: 'a', truths: ['Reads the last page of a book first.', 'Has measured the Brihadeeswarar temple, for fun.'],
      fib: 'Once arrived 40 minutes late to a cinema, on purpose.',
      why: `${a} arrives 20 minutes early to everything. A locked cinema is the family's favourite exhibit.` },
    { who: 'a', truths: ['Dressed as a lighthouse in Class 4.', 'Says her paati’s curd rice can only be attempted, never duplicated.'],
      fib: 'Takes her filter coffee with three sugars.',
      why: 'Dark, one sugar. Anything else is, in her words, a rumour.' },
    { who: 'a', truths: ['Has a spreadsheet tab for the honeymoon.', 'Gets up at 6:10 AM by choice.'],
      fib: 'Packs for trips five minutes before leaving.',
      why: `The grocery list is colour-coded. ${a} has never packed in a hurry in her life.` },
    { who: 'b', truths: ['Played a tree in the Class 3 annual day.', 'Owns a 2014 scooter named Gopal.'],
      fib: 'Has never watched a full Test match.',
      why: `Five days, no result, total contentment. ${b} brings snacks for the whole stand.` },
    { who: 'b', truths: ['Built an app that tells him when the dosa batter is ready.', 'Eats rasam rice from the pot at 11 PM, standing up.'],
      fib: 'Always loads the dishwasher the way it was left.',
      why: `${b} rearranges the dishwasher after anyone else has loaded it. The dishwasher has feelings now.` },
    { who: 'b', truths: ['Practises walking in time with the nadaswaram in the corridor.', 'Brought sweets, a speech and a spare shirt to meet her parents.'],
      fib: 'Proposed in Ooty with a perfectly steady voice.',
      why: `Shaky hands, flask of tea, and ${a} said yes before he finished.` },
    { who: 'both', truths: ['Met at a college fest over a cup of filter coffee.', 'Have lived in four cities together.'],
      fib: 'Chose their cat after a long, careful search.',
      why: 'The cat arrived uninvited and took the good cushion within the hour. Management, formally.' },
    { who: 'both', truths: ['Have never agreed on the thermostat.', 'Spent the engagement lunch arguing about the seating.'],
      fib: 'Have never once got lost on a road trip.',
      why: 'Roughly eleven times. Each blames the other’s map.' },
  ],
  tiers: [
    { min: 6, title: 'Human polygraph', line: 'Not a single fib got past you. The aunties would like to hire you for interrogations.' },
    { min: 4, title: 'Sharp ear', line: 'You listen when the stories are told. It shows.' },
    { min: 2, title: 'Easily charmed', line: 'Believes everything at weddings. A wonderful guest, a risky juror.' },
    { min: 0, title: 'Fully fooled', line: 'The couple would like to thank you for your trust, and the biryani for your attention.' },
  ],
  share: (score, total, title) => `I spotted ${score}/${total} fibs about ${a} & ${b}: ${title}. Can you beat me? `,
};
