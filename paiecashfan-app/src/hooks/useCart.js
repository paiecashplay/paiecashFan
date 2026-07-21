// ============================================================
// useCart(tenantId)
//
// Panier boutique d'un club — en mémoire (session). L'UI reste identique.
//
// ⚠️ Le front NE PARLE JAMAIS à Supabase en direct (RLS deny-all + règle
//    d'archi : tout passe par le backend). Une version précédente insérait
//    dans `orders`/`order_items` via le client Supabase → échec 400. La
//    persistance DB du panier se fera via des endpoints backend (TODO).
//
// Shape d'un item exposé (aligné sur le checkout) :
//   { id, product_id, size, quantity, unit_price_pcc, total_pcc }
// ============================================================

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

let localSeq = 1;
const nextLocalId = () => `local-${localSeq++}`;
const sameLine = (i, productId, size) => i.product_id === productId && (i.size || null) === (size || null);

export function useCart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Ajoute (ou fusionne si même produit + taille déjà au panier).
  const addItem = useCallback(({ productId, size = null, qty = 1, unitPrice = 0 }) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, productId, size));
      if (idx >= 0) {
        const next = [...prev];
        const q = next[idx].quantity + qty;
        next[idx] = { ...next[idx], quantity: q, total_pcc: q * Number(next[idx].unit_price_pcc) };
        return next;
      }
      return [...prev, {
        id: nextLocalId(), product_id: productId, size: size || null,
        quantity: qty, unit_price_pcc: unitPrice, total_pcc: qty * unitPrice,
      }];
    });
  }, []);

  const updateQty = useCallback((itemId, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.id === itemId
      ? { ...i, quantity: qty, total_pcc: qty * Number(i.unit_price_pcc) }
      : i));
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.total_pcc || 0), 0);

  return {
    items, loading: false, persisted: false,
    addItem, updateQty, removeItem, clear,
    totalItems, totalPrice,
    isAuthed: Boolean(user),
  };
}
