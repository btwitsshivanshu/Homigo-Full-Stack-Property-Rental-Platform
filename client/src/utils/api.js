import { getToken, clearToken } from './auth';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

console.log('API Base URL:', API_BASE_URL);

export function getApiUrl(endpoint) {
  if (endpoint.startsWith('http')) return endpoint;
  const url = `${API_BASE_URL}${endpoint}`;
  return url;
}

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const finalOptions = { ...options, headers };
  const fullUrl = getApiUrl(url);
  
  try {
    const res = await fetch(fullUrl, finalOptions);
    if (res.status === 401) {
      // token invalid/expired
      clearToken();
    }
    return res;
  } catch (error) {
    console.error('Fetch error:', error.message, 'URL:', fullUrl);
    throw error;
  }
}
