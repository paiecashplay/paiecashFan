import { useState, useCallback } from 'react';

const CUSTOM_IMG_KEY = 'pcc_profile_picture';
const AVATAR_SEED_KEY = 'pcc_avatar_seed';
const MAX_SIZE_MB = 5;

/* ── Avatar URL helpers ────────────────────────────────────── */

/** Pravatar - real human faces based on seed */
export function getGeneratedAvatarUrl(seed) {
  return `https://i.pravatar.cc/250?u=${encodeURIComponent(seed)}`;
}

/**
 * ui-avatars.com - always-reliable coloured initials avatar.
 * Used as the img onError fallback so there's always something visible.
 */
export function getInitialsAvatarUrl(name, email) {
  const display = (name || email || 'User').trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=059669&color=ffffff&size=200&bold=true&format=png`;
}

/** Generate a short random seed string */
function makeRandomSeed() {
  return Math.random().toString(36).slice(2, 12);
}

/** Load stored seed or create + persist a new one */
function loadOrCreateSeed() {
  try {
    const stored = localStorage.getItem(AVATAR_SEED_KEY);
    if (stored) return stored;
    const fresh = makeRandomSeed();
    localStorage.setItem(AVATAR_SEED_KEY, fresh);
    return fresh;
  } catch {
    return makeRandomSeed();
  }
}

/* ── Main hook ─────────────────────────────────────────────── */

/**
 * Profile picture priority:
 *  1. Custom uploaded image (base64, localStorage)
 *  2. Google OAuth image  (user.picture / user.google_picture)
 *  3. Pravatar real human avatar (seed stored in localStorage - reproducible)
 *
 * If Pravatar fails to load in the browser, ProfileAvatar falls back to
 * ui-avatars.com via the img onError handler.
 */
export function useProfile(user) {
  const [customImage, setCustomImage] = useState(() => {
    try { return localStorage.getItem(CUSTOM_IMG_KEY) || null; } catch { return null; }
  });
  const [avatarSeed, setAvatarSeed] = useState(loadOrCreateSeed);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  /* resolved values */
  const googleImage = user?.picture || user?.google_picture || null;

  const generatedImage = getGeneratedAvatarUrl(avatarSeed);

  const profileImage =
    customImage ||
    googleImage ||
    generatedImage;

  const imageSource = customImage
    ? 'custom'
    : googleImage
      ? 'google'
      : 'generated';

  /* fallback URL for onError on <img> */
  const fallbackImage = getInitialsAvatarUrl(user?.name, user?.email);

  /* ── Upload ──────────────────────────────────────────────── */
  const uploadImage = useCallback((file) => {
    return new Promise((resolve, reject) => {
      setUploadError(null);

      if (!file) return reject(new Error('No file provided'));
      if (!file.type.startsWith('image/')) return reject(new Error('File must be an image'));
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        const err = new Error(`Image must be under ${MAX_SIZE_MB}MB`);
        setUploadError(err.message);
        return reject(err);
      }

      setUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 512;
          const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          try { localStorage.setItem(CUSTOM_IMG_KEY, dataUrl); } catch { }
          setCustomImage(dataUrl);
          setUploading(false);
          resolve(dataUrl);
        };
        img.onerror = () => {
          setUploading(false);
          const err = new Error('Invalid image file');
          setUploadError(err.message);
          reject(err);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => {
        setUploading(false);
        const err = new Error('Failed to read file');
        setUploadError(err.message);
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  /* ── Remove custom photo ────────────────────────────────── */
  const removeImage = useCallback(() => {
    localStorage.removeItem(CUSTOM_IMG_KEY);
    setCustomImage(null);
    setUploadError(null);
  }, []);

  /* ── Regenerate avatar ──────────────────────────────────── */
  const regenerateAvatar = useCallback(() => {
    const newSeed = makeRandomSeed();
    try { localStorage.setItem(AVATAR_SEED_KEY, newSeed); } catch { }
    setAvatarSeed(newSeed);
  }, []);

  return {
    profileImage,
    customImage,
    googleImage,
    generatedImage,
    fallbackImage,
    imageSource,
    avatarSeed,
    uploading,
    uploadError,
    uploadImage,
    removeImage,
    regenerateAvatar,
    getGeneratedAvatarUrl,
    getInitialsAvatarUrl,
  };
}
