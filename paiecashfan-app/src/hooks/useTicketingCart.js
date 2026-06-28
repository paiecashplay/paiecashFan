import { useCallback, useEffect, useState } from 'react';

// Panier de billetterie persistant via localStorage : il survit au
// rafraîchissement et à la navigation entre clubs (panier unifié). La
// persistance en base (liée au compte + commande) arrivera avec le checkout PCC.
const STORAGE_KEY = 'pcf_ticketing_cart_v1';

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useTicketingCart() {
  const [cart, setCart] = useState(read);

  // Sauvegarde à chaque changement.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* quota / privé */ }
  }, [cart]);

  // Synchronise entre onglets ouverts.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === STORAGE_KEY) setCart(read()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem    = useCallback((item) => setCart((prev) => [...prev, item]), []);
  const removeItem = useCallback((index) => setCart((prev) => prev.filter((_, i) => i !== index)), []);
  const clear      = useCallback(() => setCart([]), []);

  return { cart, addItem, removeItem, clear, setCart };
}
