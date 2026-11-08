/**
 * FOOTER · one dark screen: a quiet line of poetry on the left, the essentials + share on the right.
 * Contract: mount(el, ctx). Copy lives in content/footer.js.
 */
import { html, raw, esc, onVisible, copyText, formatTime } from '../lib/dom.js';
import { icon } from '../lib/icons.js';
import { goTo } from '../core/dock.js';
import { downloadICS } from '../lib/ics.js';
import { toast } from '../core/toast.js';

export function mount(el, ctx) {
  const c = ctx.content.footer || {}, site = ctx.site, w = site.wedding;
  const A = c.actions || {}, S = c.share || {}, E = c.essentials || {};
  const poem = Array.isArray(c.poem) ? c.poem : [];
  const url = site.siteUrl || (__pageLoc.origin + __pageLoc.pathname);
  const msg = typeof S.message === 'function' ? S.message(url) : `${site.couple.pair[0].first} & ${site.couple.pair[1].first} · ${url}`;
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;
  const ic = (n, s = 17) => raw(icon(n, { size: s, stroke: 1.6 }));
  let time = ''; try { time = formatTime(new Date(w.muhurtham)); } catch {}

  el.innerHTML = html`
    <div class="ft-wrap">
      <i class="ft-glow" aria-hidden="true"></i>
      <div class="ft-grid">
        <section class="ft-poem" aria-label="A line to leave you with">
          <span class="ft-mark" aria-hidden="true">“</span>
          <blockquote class="ft-quote rv"><p>${c.quote || ''}</p><footer>${c.attribution || ''}</footer></blockquote>
          ${poem.length ? html`<div class="ft-stanza" tabindex="0" role="region" aria-label="Poem">${poem.map((l, i) => l ? html`<p class="ft-l rv" style="--d:${Math.min(i, 12) * 50}ms">${l}</p>` : raw('<p class="ft-gap" aria-hidden="true"></p>'))}</div>` : ''}
        </section>

        <aside class="ft-art" aria-label="Illustration: Prem and Nivitha in silhouette">
          <img class="ft-art__img" src="assets/photos/footer-kiss.jpg" alt="A red watercolour of Prem and Nivitha in silhouette, sharing a kiss" loading="lazy" decoding="async">
          <p class="ft-art__cap">${site.couple.pair[0].first} <em class="gold">&amp;</em> ${site.couple.pair[1].first}</p>
          <div class="ft-share">
            <p class="ft-share__t">${S.title || 'Share this website'}</p>
            <div class="ft-share__b">
              <button type="button" class="ft-chip" data-a="copy">${ic('link', 16)}<span>${S.copy || 'Copy link'}</span></button>
              <a class="ft-chip" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('message-circle', 16)}<span>${S.whatsapp || 'WhatsApp'}</span></a>
              ${canShare ? html`<button type="button" class="ft-chip" data-a="share">${ic('share-2', 16)}<span>${S.native || 'Share'}</span></button>` : ''}
            </div>
          </div>
        </aside>
      </div>
      <div class="ft-bar">
        <span class="ft-credit">${c.credit || ''}</span>
        <button type="button" class="ft-replay" data-a="replay">${ic('door-open', 16)}<span>${c.replay || 'Knock again'}</span></button>
      </div>
    </div>`;

  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'cal') { if (downloadICS(site.events, 'prem-nivitha-wedding.ics')) toast('Saved. Your calendar will take it from here.'); }
    else if (a === 'rsvp') goTo('rsvp');
    else if (a === 'copy') { const ok = await copyText(url); toast(ok === false ? url : (S.copied || 'Link copied.')); }
    else if (a === 'share') { try { await navigator.share({ title: `${site.couple.pair[0].first} & ${site.couple.pair[1].first}`, text: msg.replace(url, '').trim(), url }); } catch {} }
    else if (a === 'replay') window.kalyanam2?.replayDoor?.();
  });

  el.querySelectorAll('.rv').forEach((n) => onVisible(n, () => n.classList.add('is-in'), { threshold: .2 }));
}
