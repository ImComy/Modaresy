// utils.js

import { getAvatarSrc as resolveAvatar, getImageUrl } from '@/api/imageService';

const getDisplayName = (user) => {
  if (!user) return null;
  return (
    user.name ||
    user.fullName ||
    user.displayName ||
    user.username ||
    (user.email && user.email.split('@')[0]) ||
    null
  );
};

const getAvatarSrc = (user) => resolveAvatar(user);

const getInitials = (name) => {
  if (!name) return 'A';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

export { getDisplayName, getAvatarSrc, getInitials, getImageUrl };