/**
 * WORD BEND · content (the couple's own answer bank). Each puzzle is a grid of letters. Every letter belongs to exactly one answer, and each answer is hidden
 * as a path that BENDS through the grid (up, down, left or right, never diagonal, never reusing a square). Read the clues, then drag through
 * the letters to spell an answer. Paths can be dragged in either direction.
 * `rows`: the grid (equal-length strings; need not be square). `clues`: { a: ANSWER (A–Z), qs: [questions] }. Every question in `qs` is the same
 * difficulty: the game picks one at random for each answer each time a puzzle is shown. The letters of all answers add up to the grid size.
 * The grids below were generated and CHECKED so that each answer appears exactly once. If you change an answer, regenerate its grid
 * (a changed grid that hides an answer twice makes the puzzle unfinishable). Scoring: 100 per puzzle, minus 5 per wrong path and 15 per hint (never below 20). 200 is a perfect game.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  intro: `Every question has an answer hidden in the letters. The words bend: drag through the squares to spell one. Every letter is used exactly once.`,
  hint: 'Drag through neighbouring letters, up, down, left or right',
  puzzles: [
    { title: "Mornings, movies & music",
      rows: ["COFOC", "FFTRI", "EEHES", "LIRSU", "LERTM"],
      clues: [
        { a: "COFFEE", qs: ["Nivitha likes hers strong and black", "The bride's preferred morning fuel", "No milk, no sugar, no negotiations"] },
        { a: "FOREST", qs: ["Prem could happily spend hours exploring one", "Trees, trails and wildlife make this a happy place for the groom", "A place where Prem might lose track of time, but never interest"] },
        { a: "THRILLER", qs: ["A movie genre both enjoy", "Suspense, twists and plenty to discuss afterward", "The kind of film that makes \"one more scene\" inevitable"] },
        { a: "MUSIC", qs: ["Something that's always been part of Nivitha's life", "A constant companion through different moods", "Something the bride has never really been without"] },
      ] },
    { title: "Skies, clay & water",
      rows: ["YATNUY", "AKESSR", "KPOTTE"],
      clues: [
        { a: "SUNSET", qs: ["Nivitha loves watching the sky change into this", "The evening spectacle that can make her stop and stare", "When the sky puts on its most beautiful show"] },
        { a: "POTTERY", qs: ["One of Nivitha's creative hobbies", "Making something beautiful with clay", "A hobby involving a spinning wheel and very muddy hands"] },
        { a: "KAYAK", qs: ["One of Prem's favorite ways to explore water", "A small boat moved using a double-bladed paddle", "Something the groom would happily take onto a river"] },
      ] },
  ],
  tiers: [
    { min: .85, title: 'Knows us too well', line: 'Every answer, hardly a slip. You should have been on the guest list for the planning meeting.' },
    { min: .6, title: 'Paying attention', line: 'You clearly listened at the dinner table. A few wrong turns, which is fair: the words bend.' },
    { min: 0, title: 'Getting there', line: 'You bent a few corners and found them all in the end. The aunties are impressed.' },
  ],
  share: (score, total, title) => `I found every answer on “Word Bend” for ${b} & ${a}: ${score}/${total} (${title}). Beat me? `,
};
