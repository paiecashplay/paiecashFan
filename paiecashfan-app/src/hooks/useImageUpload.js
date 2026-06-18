// Hook d'upload d'image vers le backend → Supabase Storage "club-assets"
import { useState } from 'react';
import { apiUrl } from '@/lib/api';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  async function uploadImage(file, folder = 'misc') {
    if (!file) return null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      // apiUrl() préfixe l'URL Railway (VITE_API_BASE) — sinon en prod la
      // requête multipart tape le domaine Vercel et renvoie 405.
      const res = await fetch(apiUrl(`/api/v2/admin/clubs-crud/upload?folder=${folder}`), {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error(`Upload ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.url;
    } finally {
      setUploading(false);
    }
  }

  return { uploadImage, uploading };
}
