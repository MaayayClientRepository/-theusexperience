/**
 * CROSSWORD · content. A 13 x 13 crossword about Prem, Nivitha and the wedding (real details only; see content/story.js, us.js, wedding.js).
 * `rows`: the solved grid, one string per row ('.' is a black square). `entries`: every answer, with its start square (r, c: zero-based from the top-left)
 * and direction ('a' across, 'd' down). Clue numbers are worked out by the game from the grid. All 17 answers were checked: no accidental extra words.
 * To change a clue, edit `clue`. To change an answer, the grid has to be regenerated (letters are shared where words cross).
 * Score: 100, minus 6 per revealed word and 2 per check. Perfect score = nothing revealed or checked.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  intro: `A crossword about ${b}, ${a} and the wedding. Every clue is something you could have learned at the dinner table.`,
  hint: 'Tap a square. Tap again to switch across or down. Type, or use the keys.',
  rows: [
    ".S.L.......V.",
    "VIVI....WHEEL",
    ".L.BOOK....E.",
    ".K.R.......V.",
    "H..APOLOGISE.",
    "O........N.E.",
    "N.MUHURTHAM.P",
    "E...I....I..L",
    "S.T.L..Q.C..A",
    "THAALI.U.H..N",
    "..M.S..I.E..N",
    "..I..PRESENCE",
    "CALM...T.R..R"
  ],
  entries: [
    { a: 'MUHURTHAM', r: 6, c: 2, d: 'a', clue: "The auspicious moment at 8:15 AM on Friday: Subha ___" },
    { a: 'INAICHEER', r: 4, c: 9, d: 'd', clue: "Thursday moment that comes between the first lunch and the reception" },
    { a: 'APOLOGISE', r: 4, c: 3, d: 'a', clue: "What both of them do first, which keeps arguments short" },
    { a: 'PRESENCE', r: 11, c: 5, d: 'a', clue: "Your ___ is the gift, the couple say" },
    { a: 'PLANNER', r: 6, c: 12, d: 'd', clue: "Nivitha has a plan for the plan. She is the ___" },
    { a: 'HILLS', r: 6, c: 4, d: 'd', clue: "Perfect road-trip terrain, if possible" },
    { a: 'QUIET', r: 8, c: 7, d: 'd', clue: "What Prem first noticed about Nivitha. It only meant she was paying attention" },
    { a: 'LIBRA', r: 0, c: 3, d: 'd', clue: "Nivitha’s star sign, unsurprisingly" },
    { a: 'THAALI', r: 9, c: 0, d: 'a', clue: "The sacred knot Prem ties at the muhurtham" },
    { a: 'VEEVEE', r: 0, c: 11, d: 'd', clue: "Nivitha’s nickname" },
    { a: 'WHEEL', r: 1, c: 8, d: 'a', clue: "Where Prem sits on every road trip: at the ___" },
    { a: 'BOOK', r: 2, c: 3, d: 'a', clue: "A blessing envelope is lovely. This is lovelier" },
    { a: 'TAMIL', r: 8, c: 2, d: 'd', clue: "___ film songs, on for every drive" },
    { a: 'VIVI', r: 1, c: 0, d: 'a', clue: "Prem’s nickname" },
    { a: 'CALM', r: 12, c: 0, d: 'a', clue: "What Prem stays when something goes wrong" },
    { a: 'SILK', r: 0, c: 1, d: 'd', clue: "Bring your appetite and your good ___ to Karur" },
    { a: 'HONEST', r: 4, c: 0, d: 'd', clue: "Nivitha’s superpower: ___ feedback, kindly delivered" },
  ],
  tiers: [
    { min: 90, title: 'Crossword royalty', line: 'Not a letter wasted. You should be writing our clues for the sequel.' },
    { min: 60, title: 'Reads the room', line: 'A few nudges, and the whole story filled in. The grid is complete.' },
    { min: 0, title: 'Finished, with help', line: 'The squares are all filled in, and everyone needs a little help sometimes. Both of us certainly do.' },
  ],
  share: (score, title) => `I completed the ${b} & ${a} crossword: ${score}/100 (${title}). Beat me? `,
};
