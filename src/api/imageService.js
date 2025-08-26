import { API_BASE } from './apiService';

function joinBaseAndPath(base, p) {
  if (!base) return p;
  const trimmedBase = base.replace(/\/$/, '');
  const fixedPath = p.startsWith('/') ? p : `/${p}`;
  return `${trimmedBase}${fixedPath}`;
}

export function getImageUrl(val) {
  if (!val) return null;
  if (typeof val === 'string') {
    if (/^https?:\/\//i.test(val)) return val;
    if (val.startsWith('/')) return joinBaseAndPath(API_BASE, val);
    return val;
  }
  if (typeof val === 'object') {
    const url = val.url || val.path || null;
    if (!url) return null;
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) return url;
    if (typeof url === 'string' && url.startsWith('/')) return joinBaseAndPath(API_BASE, url);
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
