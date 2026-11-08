import site from './site.js';
/** Content for the footer (dummy). Names, dates and venue come from content/site.js. */
export default {
  quote: 'We don’t think existence wants you to be serious.',
  attribution: '',

  /**
   * The rest of the poem (the headline above already shows its first sentence). One array item per line;
   * use '' for a blank line. Set 'attribution' above if you want a credit line to show under the headline.
   */
  poem: [
    'We have not seen a serious tree.',
    'We have not seen a serious bird.',
    'We have not seen a serious sunrise.',
    'We have not seen a serious starry night.',
    '',
    'It seems they are all laughing in their own ways, dancing in their own ways.',
    '',
    'We may not understand it, but there is a subtle feeling that the whole existence is a celebration.',
  ],

  essentials: { kicker: 'The essentials', muhurtham: 'Muhurtham' },
  actions: { calendar: 'Add to calendar', directions: 'Get directions', rsvp: 'RSVP' },
  share: {
    title: 'Share this website',
    copy: 'Copy link',
    whatsapp: 'WhatsApp',
    native: 'Share',
    copied: 'Link copied. Go forth and forward it.',
    message: (url) => `${site.couple.pair[0].first} & ${site.couple.pair[1].first} are getting married! ${site.wedding.dateLabel} · ${site.wedding.city}. Knock twice to come in: ${url}`,
  },
  credit: `${site.couple.pair[0].first} & ${site.couple.pair[1].first} · 2026`,
  replay: 'Knock again',
};
