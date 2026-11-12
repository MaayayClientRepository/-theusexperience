import site from './site.js';

/**
 * ============================================================
 *  RSVP: every word, and where the replies go.
 * ============================================================
 *  1. WHERE DO REPLIES GO?   ->  `submit` just below (Google Sheet recommended; the steps are written out for you).
 *  2. THE QUESTIONS & COPY   ->  `steps`, `head`, `letter`, `done`, `failure`.
 *
 *  Placeholders in strings:  {name} the guest's first name · {bride} {groom} first names · {city} {date} from site.js
 *  In headlines, wrap a single word in *stars* to make it italic (gold in the big title).
 *  In `rich` strings, *italic* and **bold** work.
 *  Names, dates and places come from site.js. Never type them here.
 */
const bride = site.couple.bride.first;
const groom = site.couple.groom.first;

export default {
  /* ------------------------------------------------------------------------------------------------------------
   *  WHERE REPLIES GO  (no backend, nothing to host)
   * ----------------------------------------------------------------------------------------------------------*/
  submit: {
    /**
     * Pick ONE provider:
     *
     *  'demo'          (default) Nothing is sent; the whole experience still works so you can test and show it off.
     *
     *  'googleSheets'  One row per RSVP lands in your own Google Sheet. Free, private, and you can share the sheet with family.
     *                  1) Create a Sheet at sheets.new     2) Extensions -> Apps Script, paste scripts/rsvp-google-apps-script.gs
     *                  3) Deploy -> New deployment -> Web app (Execute as: Me, Access: Anyone) -> copy the URL ending in /exec
     *                  4) Paste it into googleSheetsUrl below and set provider: 'googleSheets'. Full steps are at the top of the .gs file.
     *                  (Browsers hide the reply of such requests, so the site cannot "see" Google's answer: it treats a request that
     *                   did not fail as sent. Always send yourself one test RSVP and check the sheet.)
     *
     *  'web3forms'     Replies arrive in your inbox. Free access key from https://web3forms.com (enter your email, they send the key).
     *
     *  'formspree'     Replies arrive in Formspree + email. Create a form at https://formspree.io and copy the id from its URL
     *                  (https://formspree.io/f/xxxxxxxx  ->  'xxxxxxxx').
     */
    provider: 'googleSheets',

    googleSheetsUrl: 'https://script.google.com/macros/s/AKfycbywUDGATyi4KLaIbtHmmW17N3dPseDgmcJjyJF6swmeWPVhnNzPlcYbLPdGvdOAanEcKQ/exec',   // e.g. 'https://script.google.com/macros/s/AKfycb.../exec'
    web3formsKey: '',      // e.g. '3f5a1c2e-....'
    formspreeId: '',       // e.g. 'xyzabcde'

    timeoutMs: 12000,      // give up after this long and show the WhatsApp / email fallback
    demoDelayMs: 900,      // how long the pretend "sending" takes in demo mode

    subject: `RSVP · ${bride} & ${groom}'s wedding`,
    // Pre-filled text for the WhatsApp / email fallbacks. {summary} becomes a readable list of the guest's answers.
    fallbackMessage: `Hi! This is my RSVP for ${bride} & ${groom}'s wedding:\n\n{summary}`,
    whatsapp: site.contact.whatsapp,   // digits only, from site.js
    email: site.contact.email,
  },

  /* ------------------------------------------------------------------------------------------------------------
   *  THE LEFT HALF (big type) and its three moods
   * ----------------------------------------------------------------------------------------------------------*/
  head: {
    // Shown while the guest is answering.
    ask: {
      eyebrow: 'RSVP',
      title: 'Will you\nbe *there?*',
      lead: 'A few small questions, one gold seal, and your seat is ours to keep.',
    },
    // After a "yes" is sent.
    yes: {
      eyebrow: 'Delivered',
      title: 'See you\nin *{city}.*',
      lead: 'Your reply is on the list. Bring the good wishes; we have the rest handled.',
    },
    // After a "no" is sent.
    no: {
      eyebrow: 'Delivered',
      title: 'You will be\n*missed.*',
      lead: 'Thank you for letting us know. We will raise a glass to you.',
    },
    // When the guest comes back and has already replied.
    already: {
      eyebrow: 'Already sealed',
      title: 'You have\n*replied.*',
      lead: 'Plans changed, or a cousin is joining? Edit it and send it again. No harm done.',
    },
  },

  // The deadline card. `iso` drives the live countdown ("72 days left"); leave it '' to hide the number.
  deadline: {
    label: 'Kindly reply by',
    date: '15 November 2026',
    iso: '2026-11-15',
    left: 'days left',
    leftOne: 'day left',
    today: 'Last call',
    past: 'Late replies still welcome',
  },

  /* ------------------------------------------------------------------------------------------------------------
   *  THE QUESTIONS: one at a time. The order is fixed in rsvp.js; every word lives here.
   *  `q` big question (wrap one word in *stars* for italics)   `sub` helper line   `label` field label
   * ----------------------------------------------------------------------------------------------------------*/
  nav: { back: 'Back', next: 'Continue', done: 'Done', review: 'Looks right', seal: 'Seal it', hint: 'press Enter', hintNote: 'Ctrl + Enter' },

  steps: {
    name: {
      q: 'First, *who* is writing?',
      sub: 'Your name, as it should appear on the guest list.',
      label: 'Full name', placeholder: 'Priya Venkatesh',
      error: 'We need a name for the guest list. A nickname will do.',
    },
    phone: {
      q: 'And where can we *reach* you?',
      sub: 'Wedding-week logistics only. Good-morning images are not our department.',
      label: 'Mobile or WhatsApp', placeholder: '+91 98765 43210',
      error: 'That looks a touch short. Please include the full number.',
    },
    coming: {
      q: `Will you be joining us in ${site.wedding.city}?`,
      sub: 'Take a breath. Both answers are allowed.',
      yes: 'Wouldn’t miss it', yesSub: 'Save me a seat, and a second helping',
      no: 'Sadly can’t make it', noSub: 'Celebrating from afar',
      error: 'Choose one so we know how many leaves to lay.',
    },
    guests: {
      q: 'Who is coming *with* you?',
      sub: 'Besides yourself. Family, a plus-one, a small human.',
      // One caption per head-count, 0 to max. The stepper runs from 0 to captions.length - 1.
      captions: [
        'Flying solo. Brave, free, first in the buffet line.',
        'A plus-one. Excellent. A table for two.',
        'A trio. The photographer is delighted.',
        'Four. A small procession.',
        'Five. We will need a longer banana leaf.',
        'Six. At this point it is a delegation.',
        'Seven. You appear to be a whole family tree.',
      ],
      one: 'guest', many: 'guests',
      namesTitle: 'Their names', namesSub: 'For the place cards. Blank is fine too.',
      namePlaceholder: 'Guest {n}', nameLabel: 'Name of guest {n}',
      kid: 'Under 10', kidHint: 'Under 10 years old',
    },
    note: {
      q: 'A *note* for the couple.',
      qNo: 'Leave us a *note,* then?',
      sub: `A blessing, a joke, an embarrassing story. ${bride} and ${groom} will read every one.`,
      subNo: 'A kind word, or a very bad joke. Both land well.',
      label: 'Your note', optional: 'Optional',
      placeholder: 'Dear both,',
      suggestionTitle: 'Stuck? Start with one',
      suggestions: [
        'Can’t wait to dance at your wedding.',
        'Wishing you a lifetime of filter coffee and fewer arguments.',
        'Save me a seat near the sweets.',
        'I have one embarrassing story. See you at the sangeet.',
      ],
    },
    review: {
      q: 'Read it *once* over.',
      sub: 'Tap any line to change it.',
      rows: { name: 'Name', phone: 'Phone', coming: 'Coming', guests: 'Guests', note: 'Note' },
      yes: 'Wouldn’t miss it', no: 'Sadly can’t make it', none: 'Just me', empty: 'No note',
      kidMark: 'kid',
    },
    seal: {
      q: 'Seal it in *gold.*',
      hint: 'Drag the seal onto the letter. Or tap it, we won’t judge.',
      spot: 'seal here',
      sending: 'Sending…',
      aria: 'Gold wax seal. Drag it onto the letter, or press Enter to seal.',
      btn: 'Seal it',
    },
  },

  /* The envelope the RSVP starts in: closed until tapped, closed again (and sealed) at the end. */
  envelope: {
    to: 'To {pair}',
    from: 'Your reply, please',
    open: 'Tap to open',
    aria: 'Closed envelope. Open it to reply.',
    sending: 'Sending…',
  },

  /* The letter on the final step. {name} is the full name, {guests} a list like "Ravi, Meera (kid)". */
  letter: {
    to: 'To {bride} & {groom}',
    yes: '{name} will be there.',
    yesGuests: 'Together with {guests}.',
    yesGuestsN: 'Along with {n} guest(s).',
    no: '{name} sends love from afar.',
    sign: 'With love,',
  },

  /* ------------------------------------------------------------------------------------------------------------
   *  AFTER SENDING
   * ----------------------------------------------------------------------------------------------------------*/
  done: {
    yesTitle: 'Sealed, *delivered.*',
    yesBody: 'Thank you, {name}. {bride} and {groom} will see you in {city} on **{date}**. A confirmation is not needed; we are already smiling.',
    noTitle: 'Thank you, *{name}.*',
    noBody: 'Your reply is in, and so is your note. Come and celebrate with us whenever you can.',
    alreadyTitle: 'Your reply is *in.*',
    alreadyYesBody: 'You told us **you are coming**, {name}. Changed your mind, or a cousin is joining? Edit it and send it again.',
    alreadyNoBody: 'You told us **you cannot make it**, {name}. If that has changed, edit it and send it again.',
    when: 'When', where: 'Where', with: 'Party of',
    calendar: 'Add to calendar', edit: 'Edit & send again',
    demoNote: 'Demo mode: nothing was actually sent. Real submissions are switched on in content/rsvp.js.',
    alreadyChip: 'Already replied',
  },
  failure: {
    title: 'That one did not *land.*',
    body: 'Nothing is lost; your reply is still safe on this device. Try again, or send it the old-fashioned way:',
    retry: 'Try again', whatsapp: 'WhatsApp', email: 'Email',
  },
};
