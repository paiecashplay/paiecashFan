import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

export function useFavoriteClub(tenantId) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !tenantId) {
      setFavorite(false);
      setLoading(false);
      return;
    }

    let alive = true;

    setLoading(true);

    apiFetch('/api/v2/me/favorites')
      .then((j) => {
        if (!alive) return;

        setFavorite(
          (j.data?.tenantIds || []).includes(tenantId)
        );
      })
      .catch(() => {
        if (alive) setFavorite(false);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [user, tenantId]);

  useEffect(() => {
    function handleFavoriteChanged(event) {
        const detail = event.detail;

        if (
        String(detail?.tenantId) === String(tenantId)
        ) {
        setFavorite(Boolean(detail.favorite));
        }
    }

    window.addEventListener(
        'pcf:favorite-changed',
        handleFavoriteChanged
    );

    return () => {
        window.removeEventListener(
        'pcf:favorite-changed',
        handleFavoriteChanged
        );
    };
 }, [tenantId]);

  async function toggleFavorite() {
    if (!user) {
        navigate('/login');
        return;
    }

    if (!tenantId || busy) return;

    const previous = favorite;
    const next = !previous;

    setBusy(true);

    // Mise à jour immédiate
    setFavorite(next);

    // Informe tous les composants utilisant ce club
    window.dispatchEvent(
        new CustomEvent('pcf:favorite-changed', {
        detail: {
            tenantId,
            favorite: next,
        },
        })
    );

    try {
        const j = await apiFetch(
        `/api/v2/me/favorites/${tenantId}`,
        { method: 'POST' }
        );

        // Synchronisation avec la réponse réelle du backend
        if (typeof j?.data?.favorite === 'boolean') {
        const confirmedFavorite = j.data.favorite;

        setFavorite(confirmedFavorite);

        window.dispatchEvent(
            new CustomEvent('pcf:favorite-changed', {
            detail: {
                tenantId,
                favorite: confirmedFavorite,
            },
            })
        );
        }
    } catch {
        // Annulation de la modification optimiste
        setFavorite(previous);

        window.dispatchEvent(
        new CustomEvent('pcf:favorite-changed', {
            detail: {
            tenantId,
            favorite: previous,
            },
        })
        );
    } finally {
        setBusy(false);
    }
    }

    return {
        favorite,
        loading,
        busy,
        toggleFavorite,
    };
}