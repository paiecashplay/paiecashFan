// Hook d'upload d'image vers le backend → Supabase Storage "club-assets"
import { useState } from 'react';
import { apiFetch } from '@/lib/api';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file, folder = 'misc') {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // apiFetch : préfixe l'URL Railway, envoie le token d'auth et gère le
      // multipart (le backend /upload exige désormais une session).
      const json = await apiFetch(`/api/v2/admin/clubs-crud/upload?folder=${folder}`, {
        method: 'POST',
        body: fd,
      });
      if (!json.success) throw new Error(json.error);
      return json.data.url;
    } finally {
      setUploading(false);
    }
  }

  return { uploadImage, uploading };
}
