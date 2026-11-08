/**
 * CROSSWORD · content (the couple's own answer bank). A 14 x 14 crossword about Prem and Nivitha.
 * `rows`: the solved grid, one string per row ('.' is a black square). `entries`: every answer, with its start square (r, c: zero-based from the top-left)
 * and direction ('a' across, 'd' down). Clue numbers are worked out by the game from the grid. Every run of letters in the grid is one of the answers (no accidental words).
 * Each entry has a pool of `clues`, all of the same difficulty: the game picks one at random for every answer each time a game starts.
 * Answers that also appear in Word Bend share its clues in the same pool.
 * To change a clue, edit `clues`. To change an answer, the grid has to be regenerated (letters are shared where words cross).
 * Score: 100, minus 6 per revealed word and 2 per check. Perfect score = nothing revealed or checked.
 */
import site from '../site.js';
const a = site.couple.bride.first, b = site.couple.groom.first;

export default {
  names: { a, b },
  intro: `A crossword about ${b} and ${a}. The clues change every time you play.`,
  hint: 'Tap a square. Tap again to switch across or down. Type, or use the keys.',
  rows: [
    "....B...C...M.",
    "....O.M.O...U.",
    "....O.O.FOREST",
    "KAYAK.U.F...I.",
    "....SUNSET..C.",
    "...P..T.E.....",
    "...O..A...T...",
    "...THRILLER...",
    ".P.T..N...A...",
    "CAMERA..WHITE.",
    ".I.R......L...",
    ".N.Y..BIRDS...",
    ".T............",
    ".SALAD........"
  ],
  entries: [
    { a: "THRILLER", r: 7, c: 3, d: 'a', clues: ["A movie genre both enjoy", "Suspense, twists and plenty to discuss afterward", "The kind of film that makes you say, \"Just one more scene\"", "The kind of film that makes \"one more scene\" inevitable"] },
    { a: "POTTERY", r: 5, c: 3, d: 'd', clues: ["One of Nivitha's creative interests", "Working with clay to make something by hand", "A hobby involving a wheel, a little patience and muddy hands", "One of Nivitha's creative hobbies", "Making something beautiful with clay", "A hobby involving a spinning wheel and very muddy hands"] },
    { a: "MOUNTAIN", r: 1, c: 6, d: 'd', clues: ["Prem's idea of a good challenge", "Something to climb rather than simply admire", "A holiday destination that rarely disappoints the groom"] },
    { a: "CAMERA", r: 9, c: 0, d: 'a', clues: ["Something useful for capturing a beautiful sky", "An essential companion when memories need documenting", "What you'd want nearby when the light is just right"] },
    { a: "PAINTS", r: 8, c: 1, d: 'd', clues: ["Nivitha uses these to bring ideas to life", "A creative essential for canvases and colour experiments", "What you'll find near the bride when she's in an artistic mood"] },
    { a: "SUNSET", r: 4, c: 4, d: 'a', clues: ["A daily spectacle Nivitha loves watching", "When the sky puts on its evening show", "The time of day that can make the bride stop whatever she's doing", "Nivitha loves watching the sky change into this", "The evening spectacle that can make her stop and stare", "When the sky puts on its most beautiful show"] },
    { a: "SALAD", r: 13, c: 1, d: 'a', clues: ["One of Nivitha's food preferences", "A fresh, healthy bowl with plenty of goodness", "The greener side of the bride's food choices"] },
    { a: "COFFEE", r: 0, c: 8, d: 'd', clues: ["Nivitha's preferred drink, strong and black", "The bride's ideal companion on a busy morning", "No milk, no fuss, just the good stuff", "Nivitha likes hers strong and black", "The bride's preferred morning fuel", "No milk, no sugar, no negotiations"] },
    { a: "TRAILS", r: 6, c: 10, d: 'd', clues: ["Prem enjoys wandering along these", "The paths that often lead to his favourite adventures", "Where a simple walk can become an expedition"] },
    { a: "BOOKS", r: 0, c: 4, d: 'd', clues: ["Something Nivitha enjoys spending quiet time with", "A good companion for a slow afternoon", "Pages, stories and a little uninterrupted time"] },
    { a: "BIRDS", r: 11, c: 6, d: 'a', clues: ["Something Prem rarely misses noticing outdoors", "Feathered creatures that can interrupt almost any conversation", "Look up during a walk with the groom; he probably already has"] },
    { a: "FOREST", r: 2, c: 8, d: 'a', clues: ["A place Prem would happily spend a day exploring", "Trees, trails, wildlife and very little mobile signal", "A destination where the groom is unlikely to get bored", "Prem could happily spend hours exploring one", "Trees, trails and wildlife make this a happy place for the groom", "A place where Prem might lose track of time, but never interest"] },
    { a: "WHITE", r: 9, c: 8, d: 'a', clues: ["Nivitha's favourite colour", "The shade she can never seem to get enough of", "A colour that needs no convincing in her wardrobe or surroundings"] },
    { a: "MUSIC", r: 0, c: 12, d: 'd', clues: ["Something that's always been part of Nivitha's life", "The soundtrack to many of the bride's moods", "A universal language she's never really been without", "A constant companion through different moods", "Something the bride has never really been without"] },
    { a: "KAYAK", r: 3, c: 0, d: 'a', clues: ["One of Prem's favourite outdoor activities", "A paddle-powered way to explore the water", "Something the groom would happily take out on a river", "One of Prem's favorite ways to explore water", "A small boat moved using a double-bladed paddle", "Something the groom would happily take onto a river"] },
  ],
  tiers: [
    { min: 90, title: 'Crossword royalty', line: 'Not a letter wasted. You should be writing our clues for the sequel.' },
    { min: 60, title: 'Reads the room', line: 'A few nudges, and the whole story filled in. The grid is complete.' },
    { min: 0, title: 'Finished, with help', line: 'The squares are all filled in, and everyone needs a little help sometimes. Both of us certainly do.' },
  ],
  share: (score, title) => `I completed the ${b} & ${a} crossword: ${score}/100 (${title}). Beat me? `,
};
