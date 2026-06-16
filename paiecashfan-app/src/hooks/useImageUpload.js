// Hook d'upload d'image vers le backend → Supabase Storage "club-assets"
import { useState } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file, folder = 'misc') {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/v2/admin/clubs-crud/upload?folder=${folder}`, {
        method: 'POST',
        body: fd
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.url;
    } finally {
      setUploading(false);
    }
  }

  return { uploadImage, uploading };
}
