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

export async function uploadFile(file, shape, tutorId, token) {
  if (!file) return null;
  if (!tutorId) throw new Error('uploadFile requires tutorId');
  const genBody = {
    fileName: file.name,
    contentType: file.type || 'application/octet-stream',
    fileType: shape === 'profile' ? 'pfp' : 'banner',
  };

  const genRes = await fetch(`${API_BASE}/storage/generateUploadUrl`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(genBody),
  });

  if (!genRes.ok) {
    const txt = await genRes.text();
    throw new Error(txt || 'Failed to get upload URL');
  }

  const { signedUrl, filePath } = await genRes.json();
  if (!signedUrl || !filePath) throw new Error('Invalid signed URL response');

  // Upload to GCS
  const putRes = await fetch(signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(txt || 'Upload to GCS failed');
  }

  // Notify backend
  const notifyRes = await fetch(`${API_BASE}/storage/tutor/${tutorId}/${shape === 'profile' ? 'pfp' : 'banner'}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ filePath }),
  });

  if (!notifyRes.ok) {
    const txt = await notifyRes.text();
    throw new Error(txt || 'Backend notify failed');
  }

  const parsed = await notifyRes.json();
  return parsed.profile_picture || parsed.banner || null;
}

export default { getImageUrl, getAvatarSrc, getBannerUrl };
