// Simple token utils using localStorage
export const TOKEN_KEY = 'homigo_token';

export function saveToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch {}
}

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}
