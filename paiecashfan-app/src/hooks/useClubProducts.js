import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function useClubProducts(tenantId) {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!tenantId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(
        `/api/v2/admin/clubs-crud/clubs/${encodeURIComponent(
          tenantId
        )}/products`
      );

      setProducts(response?.data?.products || []);
    } catch (err) {
      setProducts([]);

      setError(
        err?.message ||
          'Impossible de charger les produits.'
      );
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    products,
    loading,
    error,
    reload: load,
  };
}