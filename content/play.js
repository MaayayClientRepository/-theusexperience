/**
 * THE FUN HOUSE: manifest of games. Every game is one module in assets/js/games/<id>.js
 * (export function mount(container, ctx) → cleanup) with its words/data in content/games/<id>.js.
 * Add a game: add an entry here, create both files. Remove one: delete its entry.
 * All games are about the couple and their story, and each one uses a different mechanic: judging (likely), deduction (fib), card-marking (bingo), estimation (numbers), bending-path words (wordbend), crossword. Keep new games just as different.
 */
import site from './site.js';
const b = site.couple.bride.first, g = site.couple.groom.first;

export default {
  head: { eyebrow: 'The Fun House', title: 'Play with us.', lead: `How well do you really know ${b} and ${g}?` },
  games: [
    { id: 'likely',   title: 'Who’s More Likely To',  tagline: `Judge ${b} and ${g}. Then see if the crowd agrees.`, icon: 'gavel',   time: '2 min',  size: 'wide' },
    { id: 'fib',      title: 'Two Truths & a Fib',    tagline: `Three claims about us. One is a fib. Catch it.`,       icon: 'search',  time: '2 min',  size: 'tall' },
    { id: 'wordbend', title: 'Word Bend',   tagline: `Answers about us, hidden in bending paths of letters. Drag to spell them.`,  icon: 'wand-sparkles', time: '4 min', size: 'wide' },
    { id: 'crossword', title: 'The Crossword', tagline: `Seventeen clues, all about ${g}, ${b} and the wedding.`, icon: 'pencil', time: '8 min', size: 'sq' },
    { id: 'bingo',    title: 'Wedding Bingo',         tagline: 'How much of our story do you know? Get five in a row.', icon: 'grid-3x3', time: 'weekend', size: 'sq' },
    { id: 'numbers',  title: 'The Numbers of Us',     tagline: 'Slide to guess the figures behind our story.',         icon: 'hash',    time: '2 min',  size: 'wide' },
  ],
};
