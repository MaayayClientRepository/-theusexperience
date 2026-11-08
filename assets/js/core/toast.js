/** Minimal glass toasts:  toast('Copied!')  */
let root;
export function toast(message, { duration = 2600 } = {}) {
  root = root || document.getElementById('toasts');
  if (!root) return;
  while (root.children.length >= 2) root.firstChild.remove();
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = message;
  root.appendChild(t);
  setTimeout(() => { t.classList.add('is-out'); setTimeout(() => t.remove(), 420); }, duration);
}
export default toast;
