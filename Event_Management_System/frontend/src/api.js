const API = 'http://localhost:5000/api';
export function getToken() { return localStorage.getItem('event_token'); }
export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong.');
  return data;
}
