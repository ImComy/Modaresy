import { API_BASE } from './apiService';

export function getImageUrl(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    if (val.startsWith('/')) return `${API_BASE}${val}`;
    return val;
  }
  if (typeof val === 'object') {
    const url = val.url || val.path || null;
    if (!url) return null;
    if (typeof url === 'string' && url.startsWith('/')) return `${API_BASE}${url}`;
    return url;
  }
  return null;
}

export function getAvatarSrc(user) {
  if (!user) return null;
  const fromProfile = user.profile_picture || user.img || null;
  return getImageUrl(fromProfile);
}

export function getBannerUrl(tutor) {
  if (!tutor) return null;
  const fromBanner = tutor.banner || tutor.bannerimg || null;
  return getImageUrl(fromBanner);
}

export default { getImageUrl, getAvatarSrc, getBannerUrl };
