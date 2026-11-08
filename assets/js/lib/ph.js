/**
 * Photo placeholders that look intentional:  ph({ label:'First meeting', file:'assets/photos/story/first-meet.jpg', ratio:'4/5' })
 * While site.usePlaceholders is true (content/site.js) or the file is missing, an elegant luminous placeholder is drawn that prints the
 * file path it expects; once real photos are dropped in and usePlaceholders is false, the real <img> is used (falling back to the
 * placeholder if a file 404s). ratio: 'W/H' | null (fill the parent: width/height 100%).
 */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let seed = 0;
export function ph({ label = 'Photo', file = '', ratio = '4/5', tone = 'gold', className = '', initial = '' } = {}) {
  const w = window.kalyanam2;
  const placeholders = !w || w.site?.usePlaceholders !== false || !file;
  const style = ratio ? `aspect-ratio:${String(ratio).replace('/', ' / ')};` : 'width:100%;height:100%;';
  const s = (++seed % 5) + 1;
  const holder = `<div class="ph ph--${tone} ph--v${s} ${esc(className)}" style="${style}" role="img" aria-label="${esc(label)}"><i class="ph__orb" aria-hidden="true"></i>${initial ? `<b class="ph__initial" aria-hidden="true">${esc(initial)}</b>` : ''}<span class="ph__label">${esc(label)}</span>${file ? `<code class="ph__file">${esc(file)}</code>` : ''}</div>`;
  if (placeholders) return holder;
  const fb = holder.replace(/\n/g, '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<img class="ph-img ${esc(className)}" src="${esc(file)}" alt="${esc(label)}" loading="lazy" decoding="async" style="${style}object-fit:cover;" onerror="this.outerHTML='${fb}'">`;
}
export default ph;
