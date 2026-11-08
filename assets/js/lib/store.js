/**
 * Tiny, crash-proof persistence. Everything is namespaced under "kalyanam:".
 * localStorage can be unavailable (private mode, blocked storage) — every call is wrapped.
 *
 *   store.get('tribe', null)      store.set('tribe', 'zoho')      store.remove('tribe')
 *   session.get('introSeen')      session.set('introSeen', true)
 */
const NS = 'kalyanam:';

function make(getStorage) {
  return {
    get(key, fallback = null) {
      try {
        const raw = getStorage().getItem(NS + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try { getStorage().setItem(NS + key, JSON.stringify(value)); return true; } catch { return false; }
    },
    remove(key) {
      try { getStorage().removeItem(NS + key); } catch { /* ignore */ }
    },
  };
}

export const store = make(() => window.localStorage);
export const session = make(() => window.sessionStorage);
export default store;
