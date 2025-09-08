import { apiFetch } from './apiService';

let cachedConstants = null;

export async function getConstants(forceRefresh = false) {
  if (cachedConstants && !forceRefresh) {
    return cachedConstants;
  }

  cachedConstants = await apiFetch("/constants");
  return cachedConstants;
}

export function getConstantsSync() {
  console.log("cachedConstants", cachedConstants);
  return cachedConstants;
}
