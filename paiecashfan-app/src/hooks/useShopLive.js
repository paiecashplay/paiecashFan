import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const BASE = '/api/v2/shop-live';

// Gestion du live boutique d'un club (BO). Toutes les actions passent par le
// backend (apiFetch). Après chaque action mutante, on recharge l'état depuis le
// serveur (reload) pour rester cohérent.
export function useShopLive(slug) {
  const [room, setRoom] = useState(null);
  const [liveProducts, setLiveProductsState] = useState([]);
  const [byteplusConfigured, setByteplusConfigured] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  // Charge le live courant + ses produits.
  const load = useCallback(async () => {
    if (!slug) {
      setRoom(null); setLiveProductsState([]); setByteplusConfigured(false);
      setError(''); setLoading(false);
      return;
    }
    setLoading(true); setError('');
    try {
      const response = await apiFetch(`${BASE}/club/${encodeURIComponent(slug)}/admin`);
      setRoom(response?.data?.room || null);
      setLiveProductsState(Array.isArray(response?.data?.products) ? response.data.products : []);
      setByteplusConfigured(Boolean(response?.data?.byteplusConfigured));
    } catch (loadError) {
      setRoom(null); setLiveProductsState([]); setByteplusConfigured(false);
      const message = loadError?.message || '';
      // Le module reste "vide" tant que la migration/backend ne répondent pas.
      if (loadError?.status === 404 || message.includes('shop_live_rooms') || message.includes('schema cache')) {
        setError('');
      } else {
        setError(message || 'Impossible de charger le live boutique.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  // Enveloppe commune : gère actionLoading/actionError + reload après succès.
  const run = useCallback(async (fn) => {
    setActionLoading(true); setActionError('');
    try {
      const result = await fn();
      await load();
      return result;
    } catch (e) {
      setActionError(e?.message || 'Action impossible.');
      throw e;
    } finally {
      setActionLoading(false);
    }
  }, [load]);

  const createLive = useCallback((payload = {}) => run(async () => {
    if (!slug) throw new Error('Club introuvable.');
    const r = await apiFetch(`${BASE}/club/${encodeURIComponent(slug)}/create`, {
      method: 'POST',
      body: JSON.stringify({
        title: payload.title,
        description: payload.description ?? null,
        scheduledAt: payload.scheduledAt ?? null,
        scheduledEndAt: payload.scheduledEndAt ?? null,
        coverUrl: payload.coverUrl ?? null,
        releasePlayback: payload.releasePlayback !== false,
        // latencyMode omis volontairement → défaut serveur ('normal').
      }),
    });
    return r?.data?.room || null;
  }), [slug, run]);

  const updateLive = useCallback((updates = {}) => run(async () => {
    if (!room?.id) throw new Error('Aucun live à modifier.');
    const r = await apiFetch(`${BASE}/${encodeURIComponent(room.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: updates.title,
        description: updates.description,
        scheduledAt: updates.scheduledAt,
        scheduledEndAt: updates.scheduledEndAt,
        coverUrl: updates.coverUrl,
      }),
    });
    return r?.data?.room || null;
  }), [room, run]);

  const cancelLive = useCallback(() => run(async () => {
    if (!room?.id) throw new Error('Aucun live à annuler.');
    await apiFetch(`${BASE}/${encodeURIComponent(room.id)}`, { method: 'DELETE' });
    return true;
  }), [room, run]);

  // Passe en direct : le backend renvoie l'URL de diffusion navigateur (studio).
  const startLive = useCallback(() => run(async () => {
    if (!room?.id) throw new Error('Aucun live boutique à démarrer.');
    const r = await apiFetch(`${BASE}/${encodeURIComponent(room.id)}/start`, { method: 'POST' });
    return {
      room: r?.data?.room || null,
      broadcastUrl: r?.data?.broadcastUrl || null,
      broadcastError: r?.data?.broadcastError || null,
    };
  }), [room, run]);

  const endLive = useCallback((payload = {}) => run(async () => {
    if (!room?.id) throw new Error('Aucun live à arrêter.');
    const r = await apiFetch(`${BASE}/${encodeURIComponent(room.id)}/end`, {
      method: 'POST',
      body: JSON.stringify({ replayUrl: payload.replayUrl ?? null }),
    });
    return r?.data?.room || null;
  }), [room, run]);

  // Reçoit un tableau de produits (objets OU ids) → envoie la liste d'ids.
  const setLiveProducts = useCallback((products = []) => run(async () => {
    if (!room?.id) throw new Error('Aucun live actif.');
    const productIds = (Array.isArray(products) ? products : [])
      .map((p) => (p && typeof p === 'object' ? (p.id ?? p.product_id) : p))
      .filter(Boolean);
    const r = await apiFetch(`${BASE}/${encodeURIComponent(room.id)}/products`, {
      method: 'PUT',
      body: JSON.stringify({ productIds }),
    });
    return r?.data?.products || [];
  }), [room, run]);

  const removeLiveProduct = useCallback((productId) => run(async () => {
    if (!room?.id) throw new Error('Aucun live actif.');
    await apiFetch(`${BASE}/${encodeURIComponent(room.id)}/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
    return true;
  }), [room, run]);

  // Met un produit en avant (ou retire la mise en avant si productId nul).
  const featureProduct = useCallback((productId) => run(async () => {
    if (!room?.id) throw new Error('Aucun live actif.');
    const r = await apiFetch(`${BASE}/${encodeURIComponent(room.id)}/featured-product`, {
      method: 'PATCH',
      body: JSON.stringify({ productId: productId ?? null }),
    });
    return r?.data || null;
  }), [room, run]);

  const clearActionError = useCallback(() => setActionError(''), []);

  return {
    room,
    liveProducts,
    byteplusConfigured,

    loading,
    actionLoading,

    error,
    actionError,

    reload: load,

    createLive,
    updateLive,
    cancelLive,
    startLive,
    endLive,

    setLiveProducts,
    removeLiveProduct,
    featureProduct,

    clearActionError,
  };
}
