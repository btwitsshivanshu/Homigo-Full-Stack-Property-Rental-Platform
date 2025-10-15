import { getToken, clearToken } from './auth';

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const finalOptions = { ...options, headers };
  const res = await fetch(url, finalOptions);
  if (res.status === 401) {
    // token invalid/expired
    clearToken();
  }
  return res;
}
