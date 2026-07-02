import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

// Charge la candidature club du user connecté (null si aucune).
export function useOnboarding() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const json = await apiFetch('/api/v2/onboarding/application');
      setApplication(json?.data?.application || null);
      setError('');
    } catch (e) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { application, loading, error, reload, setApplication };
}
