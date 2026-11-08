import site from './site.js';
const B = site.couple.bride, G = site.couple.groom;
/**
 * THE COUPLE. Copy comes from the "Prem & Nivitha: Wedding Website Copy" doc (screens 10–21).
 * Names come from content/site.js. Photos: assets/photos/us/<name>.jpg (placeholders print the path they expect).
 * Each person has: card (the tile on the page) and a profile (the full-screen sheet). Both sheets share one layout:
 * hero · then (swipe) & now · qa ("Asked about …") · favs (the 8 orbiting moons) · review (scored by the partner) · strip (photos).
 * Prem's page is written by Nivitha; Nivitha's page is written by Prem.
 * `review` rows reuse the `friends` shape: name = category, rel = the "Observed …" line, text = comment on the card.
 */
export default {
  bride: {
    role: 'The bride',
    name: B.first, full: B.full, nick: B.nick,
    descriptor: 'Sharp, warm, honest, and organised enough for both of us.',
    bioNote: `This bio was written by ${G.first}, her groom.`,
    bioBy: G.first,
    bio: [
      `Nivi is a rather rare specimen. Smart, witty, full of life, and blessed with the unusual ability to distinguish between things worth caring about and things that simply aren’t worth the blood pressure. She has a wonderful mind, and a great sense of humour. She’s one of those rare fish in the ocean who seems to have missed the memo about being ordinary.`,
      `She loves a little colour, a little art, a little beauty in the everyday, and has a knack for making even the simplest things feel special. She can be incredibly thoughtful, fiercely supportive, and surprisingly stubborn when she knows she’s right (which, unfortunately, is quite often). She’s got a soft heart, a sharp tongue, and an excellent sense of when to deploy either.`,
      `She’s also rather good at keeping things in perspective. While some people encourage your questionable decisions, Nivi will let you finish explaining them, patiently identify every flaw, and then rescue you from the consequences. She somehow manages to make perfect sense of my nonsense, and, rather concerningly, actually encourages it. She’s the strength behind so many things I do, the quiet confidence that makes me believe I can pull off even my most questionable plans.`,
      `If I ever get a little too close to the fire, she’s the one who will happily drag me back to safety, probably after giving me a very well-reasoned lecture. She’s my sounding board, my compass, my biggest cheerleader.`,
      `She has this lovely way of making people feel understood without making a big production of it. She celebrates the little things, stands firm when it matters, and brings an extraordinary amount of warmth, laughter, and colour wherever she goes.`,
      `If my life were a movie, she’d be its background score. Not always the thing you notice, but take it away, and the whole thing falls flat. She’s the music to my life, and I wouldn’t have it any other way.`,
    ],
    bioHeart: true,
    bioSign: 'PV',   // “- PV” on the right, after the closing quote
    photo: 'assets/photos/us/nivitha-card.jpg',   // one photo: the home card and the profile hero share it
    facts: [['Born', '3 October 2000']],
    tags: ['Sharp', 'Organised', 'Honest'],
    // TODO: portrait caption from the doc ("Nivitha, mid-plan") has no slot on the page yet
    askedHead: ['Asked about', 'Nivitha'],
    qa: [
      { q: 'Describe Nivitha in one sentence.', a: 'A rare combination of brains, beauty, wit and a heart of gold, with just the right amount of calm to keep life interesting.' },
      { q: 'What did you first notice about her?', a: 'How incredibly thoughtful she is. She remembers the little things, listens to things you probably didn’t realise you were saying, and somehow has an ear for everything. You could casually mention something in passing three weeks ago, and she’ll bring it up like she’s been maintaining minutes of the meeting. Her attention to detail is rather impressive, and occasionally quite dangerous!' },
      { q: 'Her most unreasonable habit?', a: 'She’s what we affectionately call “Fastuh”. A little fidgety, a little whimsical, and perpetually operating at a speed her hands haven’t quite caught up with. Things happen on a whim, objects mysteriously change hands, and butterfingers make a regular appearance. If something can be dropped, misplaced or done in a hurry, she’ll find a way. We love the enthusiasm, though!' },
      { q: 'Her superpower?', a: 'She simply doesn’t know how to stay angry. She’d rather sit you down, talk things through, understand every possible angle and find a solution. Give her an enemy territory and she’ll probably return with a peace treaty, three new friends and an invitation to dinner. Diplomacy has found its final boss.' },
      { q: 'What happens when something goes wrong?', a: 'Fix it. What else? She’s not one to sit around admiring the problem. Assess, discuss, devise a plan and get it sorted. And if all else fails, well, I’m sure we’ll find something to do about it. 😏' },
      { q: 'Marriage advice you will actually follow?', a: 'Live like we aren’t. Make time for each other, even when life gets busy. Collect experiences, make ridiculous memories, keep discovering new things, and grow together without ever growing out of each other. And never underestimate the importance of a good laugh (or a well-timed apology).' },
      { q: 'A perfect Sunday with her?', a: 'A lazy day in, with absolutely nowhere to be and no reason to pretend we’re productive. Perfect lighting, strong coffee, some gentle music, ridiculously good food delivered straight to bed, and a movie we’ve probably seen before but will happily watch again. Bonus points if it rains outside. The world can wait; we’ve got a very important Sunday to attend to.' },
    ],
    favs: [
      { icon: 'lock', label: 'The Classified Archives', fact: 'Has a secret journal. Its contents are classified, its author is uncompromising, and my clearance application has been rejected indefinitely.' },
      { icon: 'calculator', label: 'The Hidden Calculator', fact: 'Secretly rather good at maths. Don’t let the innocent face fool you.' },
      { icon: 'wind', label: 'Wind Therapy', fact: 'A brilliant pillion rider who loves the wind in her face. Apparently, two wheels and a long road are all the therapy one needs.' },
      { icon: 'heart-handshake', label: 'The Trust Fall', fact: 'Give her a driver she trusts, and she’ll happily follow the horizon. The destination, the speed, the route, the detours, all yours. Just don’t break the trust!' },
      { icon: 'star', label: 'Five-Star Expectations', fact: 'Believes every restroom deserves a five-star rating. Even in the middle of a forest, nature is beautiful, but standards must be maintained.' },
      { icon: 'sunset', label: 'Sky Enthusiast', fact: 'Can lose herself watching the sky change colours. Sunsets, clouds, shifting light — she’ll find a reason to stop and look up.' },
      { icon: 'palette', label: 'The Creative Department', fact: 'Can switch between painting, making kolams, experimenting in the kitchen and making dosas like it’s all part of the same job description.' },
      { icon: 'coffee', label: 'A Recent Conversion', fact: 'A tea lover in the making. A rather recent discovery, but she’s embracing it with the enthusiasm of someone who’s been a tea connoisseur all her life.' },
    ],
    review: { eyebrow: 'Scored by Prem', note: 'Appeals are pending.' },
    overall: 4.9,   // shown as the big score; the six cards are the playful evidence (leave out to use the real average)
    friends: [
      { name: 'Thoughtfulness', rel: 'Observed since June 2022', since: '', stars: 5, when: '', text: 'Remembers things you didn’t know you mentioned.' },
      { name: 'Diplomacy', rel: 'Observed in all conditions', since: '', stars: 5, when: '', text: 'Can turn an enemy into an ally before the coffee gets cold.' },
      { name: 'Staying calm', rel: 'Observed in all conditions', since: '', stars: 5, when: '', text: 'Would rather find a solution than win an argument.' },
      { name: 'Organisation', rel: 'Observed daily', since: '', stars: 4.5, when: '', text: 'Has a plan, a backup plan, and a plan for the backup.' },
      { name: 'Empathy', rel: 'Observed on every outing', since: '', stars: 4.5, when: '', text: 'Has an ear for everything and a heart for what matters.' },
      { name: 'Butterfingers', rel: 'Observed on every kitchen visit', since: '', stars: 2, when: '', text: 'Excellent at multitasking. Less excellent at holding things.' },
    ],
    mentions: ['Thoughtful', 'Diplomatic', 'Calm', 'Empathetic'],
    stripTitle: ['Nivitha, in', 'frames'],
    strip: ['The office, June 2022', 'A Sunday with a book', 'Planning the next trip', 'On the road, with a plan', 'The day we decided', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.'],
    then: {
      title: 'Then & now',
      a: { year: '2022', label: 'Then', file: 'assets/photos/us/nivitha-then.jpg' },
      b: { year: '2026', label: 'Now', file: 'assets/photos/us/nivitha-now.jpg' },
    },
  },

  groom: {
    role: 'The groom',
    name: G.first, full: G.full, nick: G.nick,
    descriptor: 'Thoughtful, hardworking, gently messy, and calm enough to make the rest of us look dramatic.',
    bioNote: `This bio was written by ${B.first}, his bride.`,
    bioBy: B.first,
    bio: [
      `Prem has never met a mountain he didn’t want to climb, a water body he didn’t want to swim in, a trail he didn’t want to wander off on, or a leech bite he was sad about. :)`,
      `An only child who grew up doing everything on his own, he has somehow turned out to be one of the warmest-hearted people I know. He's curious about the world, drawn to nature, and so thoughtful in ways that don't always announce themselves.`,
      `He has a way of making life feel a little less ordinary and quietly changing people's lives just by being himself. He didn’t need an [[Insta account|https://www.instagram.com/premexperiences/]] to influence people, if you ask me. Ask him to plan a relaxing vacation, and he'll suggest skydiving, scuba diving, and a marathon before breakfast!`,
      `And when something truly interests him, he gives it everything. Sleep, hunger, time (and occasionally, Nivi) can all wait. (Oops.)`,
      `He feels deeply, notices the little things about the people he loves, and will show up at your door at 3 AM if you need him. Every dog on the street gets a hello, every bird overhead gets his attention, and somewhere in his heart, there's a room for every creature, whether it flies, crawls, swims, or slithers!`,
      `I am so glad the universe pushed this goofball my way! :)`,
    ],
    bioSign: true,   // ends the bio with “- ♡” (a hand-drawn heart)
    photo: 'assets/photos/us/prem-card.jpg',   // one photo: the home card and the profile hero share it
    facts: [['Born', '7 September 2000']],
    tags: ['Thoughtful', 'Gentle', 'Fixes things'],
    // TODO: portrait caption from the doc ("Prem, in his calmest form") has no slot on the page yet
    askedHead: ['Asked about', 'Prem'],
    qa: [
      { q: 'Describe Prem in one sentence.', a: 'The kindest, most thoughtful, ridiculously loving and intelligent person I know, who never gives up on me and will forever be my biggest cheerleader. A little too adventurous for his own good, but we’ll let that slide.' },
      { q: 'What did you first notice about him?', a: 'He was different. There was something about the way he looked at life, the way he spoke about his family, and how much importance he gave to growing as a person. He was so genuinely kind about everything. He seemed to approach life with a certain curiosity and openness that I hadn’t quite come across before. I remember thinking there was a lot more to this guy than first meets the eye.' },
      { q: 'His most unreasonable habit?', a: 'His absolute refusal to plan things in advance! Prem and the concept of planning have never really been the best of friends. He’s perpetually operating on the assumption that everything will somehow work itself out. And to be fair, sometimes it does. His spontaneity has its charm, but there’s always that little window of chaos before it does.' },
      { q: 'His superpower?', a: 'The sheer amount of things this man can fit into one day is honestly ridiculous. A marathon, a project, a new adventure, some obscure discovery he’s suddenly fascinated by, all in the same day, apparently. And when something catches his interest, the rest of the world might as well disappear. Sleep, hunger and time are merely suggestions. I always wonder if he’s secretly figured out how to get more than 24 hours out of a day.' },
      { q: 'What happens when something goes wrong?', a: 'Calm as a cucumber. While I’m probably thinking of seventeen different things that could go wrong, he’s somewhere taking his own sweet time, looking at the situation from an entirely different angle. He may move at the pace of a tortoise, but somehow comes up with a perspective I hadn’t considered and eventually gets things sorted. There’s something rather reassuring about that.' },
      { q: 'Marriage advice you will actually follow?', a: 'Take each other’s conversations seriously. Make time for each other, even when life gets busy. Be patient, be kind, and never stop trying to understand the person you’re with. And perhaps the most important thing is to keep working on yourself. The more you grow as a person, the better a partner you can be. We owe each other the best versions of ourselves, not just the convenient ones.' },
      { q: 'A perfect Sunday with him?', a: 'Some good home-cooked food, reading a book together, a really good thriller or detective movie, strong black coffee, and just the two of us. Honestly, I don’t think I’d ever get bored of a day like that. It’s something I’m always going to be grateful for.' },
    ],
    favs: [
      { icon: 'list-checks', label: 'The Never-Ending To-Do List', fact: 'Relaxation and Prem have a rather complicated relationship. There’s always something to do, something to achieve, or somewhere to explore. He pushes himself so hard that I’m not entirely sure he knows when to stop. Taking a break is apparently a skill he’s still learning.' },
      { icon: 'wrench', label: 'The Resident Handyman', fact: 'Electrical problems? Plumbing issues? Something around the house refusing to cooperate? No need to panic. I’ve got my man. He’ll investigate, take things apart, figure out what’s wrong and somehow get them working again. Professional assistance is rarely the first resort.' },
      { icon: 'moon', label: 'After-Hours Operations', fact: 'A proper night owl. Some of his most productive hours happen when the rest of the world has called it a day. When he’s working on something he cares about, he pours his entire soul into it. Unfortunately, this also means his hard work occasionally goes unnoticed because everyone else is fast asleep.' },
      { icon: 'home', label: 'The Housekeeping Department', fact: 'Can organise an elaborate adventure, manage complicated projects and plan an entire expedition, but putting things back where they belong? That’s apparently asking a little too much. He genuinely doesn’t believe a tidy house adds much value to his productivity. We have agreed to disagree.' },
      { icon: 'film', label: 'The Unfinished Business', fact: 'He cannot sleep without knowing how a movie ends, even if it’s the most boring film ever made. And it’s not just movies. He needs to know the why behind everything. A simple answer is rarely enough, and Google has probably been kept busy on his account.' },
      { icon: 'door-open', label: 'The Permanent Yes-Man', fact: 'New place? New food? Some obscure adventure? Something neither of us has tried before? He’s in. Doesn’t matter what time it is, where we’re going or who’s coming along. If there’s a new experience to be had, Prem is probably already halfway out the door.' },
      { icon: 'headphones', label: 'The Selective Listener', fact: 'For someone who’s interested in almost everything, he’s surprisingly particular about where he spends his energy. If something doesn’t have a purpose or meaning to him, it might as well not have been said. Getting his attention is easy; convincing him something is worth his time is another matter.' },
      { icon: 'heart', label: 'The Unpolished Gentleman', fact: 'Underneath all that adventure, ambition and endless curiosity is an incredibly soft-hearted man. He values the raw, real moments of life over anything polished for appearances. He’s thoughtful, empathetic and comfortable being himself. A man with his own idea of what being a man means, and honestly, I wouldn’t have it any other way.' },
    ],
    review: { eyebrow: 'Prem’s rating, written by Nivi', note: 'Appeals are pending.' },
    friends: [
      { name: 'Adventure planning', rel: 'Observed on every trip', since: '', stars: 5, when: '', text: 'Can plan a 12-hour bike ride to a place you’ve never heard of. Actual preparation may vary.' },
      { name: 'Knowing when to stop', rel: 'Observed in all conditions', since: '', stars: 2, when: '', text: 'Sleep, hunger and time are apparently negotiable when something interesting comes along.' },
      { name: 'Risk assessment', rel: 'Observed on every trail', since: '', stars: 1, when: '', text: 'Sees a mountain, a river or an unfamiliar trail and immediately starts considering the possibilities. The risk assessment can come later.' },
      { name: 'Sleep discipline', rel: 'Observed nightly', since: '', stars: 1, when: '', text: 'Sleep is apparently optional when there’s something interesting to explore, discover or finish.' },
      { name: 'Problem solving', rel: 'Observed in all conditions', since: '', stars: 5, when: '', text: 'Give him a difficult situation and he’ll find a way through it. Might take the scenic route, but he’ll get there.' },
      { name: 'Ability to sit still', rel: 'Observed on every weekend', since: '', stars: 1, when: '', text: 'A perfectly good day indoors can quickly become an expedition. Sitting still is clearly not the assignment.' },
    ],
    mentions: ['Adventurous', 'Calm', 'Problem-solver', 'Restless'],
    stripTitle: ['Prem, in', 'frames'],
    strip: ['The office, June 2022', 'On the road, almost on time', 'Fixing something, again', 'At the wheel, Tamil songs on', 'The day we decided', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.', 'Caption to come.'],
    then: {
      title: 'Then & now',
      a: { year: '2022', label: 'Then', file: 'assets/photos/us/prem-then.jpg' },
      b: { year: '2026', label: 'Now', file: 'assets/photos/us/prem-now.jpg' },
    },
  },

  /** Labels shared by both sheets */
  labels: {
    own: ['In her own words', 'In his own words'],
    tap: 'Tap a question to reveal the answer',
    otherSays: (name) => `${name} adds`,
    facts: { eyebrow: 'Astronomy', title: 'Little-known facts', sub: ['Drag to spin the moons. Tap one to learn why it orbits her.', 'Drag to spin the moons. Tap one to learn why it orbits him.'], why: ['Why it orbits her', 'Why it orbits him'] },
    friends: { eyebrow: 'Scored', title: 'The review', reviews: (n) => `${n} categories`, mention: 'People mention' },
    strip: 'Frames',
    close: 'Back to the couple',
  },
};
