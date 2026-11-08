/**
 * WORD BEND · content. Each puzzle is a grid of letters. Every letter belongs to exactly one answer, and each answer is hidden as a
 * path that BENDS through the grid (up, down, left or right, never diagonal, never reusing a square). Read the clues, then drag through
 * the letters to spell an answer. Paths can be dragged in either direction. Clues are all about Prem, Nivitha and the wedding (canon only).
 * `rows`: the grid (equal-length strings). `clues`: { a: ANSWER (A–Z), q: the question }. The letters of all answers add up to the grid size.
 * The grids below were generated and CHECKED so that each answer appears exactly once. If you change an answer, regenerate its grid
 * (a changed grid that hides an answer twice makes the puzzle unfinishable). Scoring: 100 per puzzle, minus 5 per wrong path and 15 per hint (never below 20). 300 is a perfect game.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  intro: `Every question has an answer hidden in the letters. The words bend: drag through the squares to spell one. Every letter is used exactly once.`,
  hint: 'Drag through neighbouring letters, up, down, left or right',
  puzzles: [
    { title: 'How we met',
      rows: ['OJUTEA', 'FFNKFM', 'SIEIOS', 'PCDNUM', 'OEESRE', 'KEGASS'],
      clues: [
        { a: 'OFFICE',   q: 'Where it all started, in 2022' },
        { a: 'JUNE',     q: 'The month they met' },
        { a: 'TEAMS',    q: 'They work on different ones, at the same company' },
        { a: 'SPOKE',    q: `Who did it first? ${a} ___ first, which is on the record` },
        { a: 'KIND',     q: `What ${a} first noticed about ${b}` },
        { a: 'MESSAGES', q: 'What barely stopped after that first day' },
        { a: 'FOUR',     q: 'Cities lived or worked in, so far' },
      ] },
    { title: 'The big day',
      rows: ['MAHNOV', 'GAALCE', 'LRFFOM', 'ANEREB', 'KDELUN', 'ARURHC'],
      clues: [
        { a: 'KARUR',    q: 'The town hosting the wedding' },
        { a: 'MAHAL',    q: `Prem ___, the venue (it shares a name with ${b})` },
        { a: 'NOVEMBER', q: 'The month of the wedding' },
        { a: 'GARLAND',  q: 'Exchanged at the muhurtham' },
        { a: 'LUNCH',    q: 'There are two, one each day. Come hungry' },
        { a: 'COFFEE',   q: 'The counter opens at 6:30 AM. Bring a tumbler' },
      ] },
    { title: 'Just us',
      rows: ['VIMESS', 'FRSONY', 'IGORGS', 'XMEOAD', 'ERMOPT', 'SEIRIR'],
      clues: [
        { a: 'MEMORIES', q: 'Four and a half years of them, and counting' },
        { a: 'ROADTRIP', q: 'Thirty-two so far. Hills if possible' },
        { a: 'SONGS',    q: 'Tamil film ___ on, for every drive' },
        { a: 'VIRGO',    q: `${b}'s sign, despite the mess` },
        { a: 'MESSY',    q: `${b} is gently ___` },
        { a: 'FIXER',    q: `Broken, stuck or bothering you? ${b} is the ___` },
      ] },
  ],
  tiers: [
    { min: .85, title: 'Knows us too well', line: 'Every answer, hardly a slip. You should have been on the guest list for the planning meeting.' },
    { min: .6, title: 'Paying attention', line: 'You clearly listened at the dinner table. A few wrong turns, which is fair: the words bend.' },
    { min: 0, title: 'Getting there', line: 'You bent a few corners and found them all in the end. The aunties are impressed.' },
  ],
  share: (score, total, title) => `I found every answer on “Word Bend” for ${b} & ${a}: ${score}/${total} (${title}). Beat me? `,
};
