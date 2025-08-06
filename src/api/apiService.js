export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token"); 
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Fetch error');
  }

  return data;
}