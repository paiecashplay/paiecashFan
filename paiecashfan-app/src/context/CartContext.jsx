// ============================================================
// CartContext — panier boutique GLOBAL (session, en mémoire).
// Rendu global pour être visible depuis la navbar. Le checkout étant par
// club, le panier est rattaché à UN club : ouvrir la boutique d'un autre
// club repart d'un panier vide.
//
// ⚠️ Aucune requête Supabase directe (règle d'archi). La persistance DB
//    éventuelle passera par le backend.
// ============================================================

import { createContext, useContext, useState, useRef, useCallback } from 'react';

const CartContext = createContext(null);
const sameLine = (i, productId, size) => i.product_id === productId && (i.size || null) === (size || null);
let seq = 1;

export function CartProvider({ children }) {
  const [club, setClub] = useState(null);   // { slug, name, primaryColor }
  const [items, setItems] = useState([]);
  const clubRef = useRef(null);

  // Le boutique déclare son club. Changement de club → nouveau panier.
  const setCartClub = useCallback((c) => {
    if (!c || !c.slug) return;
    if (clubRef.current && clubRef.current.slug !== c.slug) setItems([]);
    clubRef.current = c;
    setClub(c);
  }, []);

  const addItem = useCallback(({ productId, size = null, qty = 1, unitPrice = 0 }) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, productId, size));
      if (idx >= 0) {
        const next = [...prev];
        const q = next[idx].quantity + qty;
        next[idx] = { ...next[idx], quantity: q, total_pcc: q * Number(next[idx].unit_price_pcc) };
        return next;
      }
      return [...prev, { id: `c-${seq++}`, product_id: productId, size: size || null, quantity: qty, unit_price_pcc: unitPrice, total_pcc: qty * unitPrice }];
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty, total_pcc: qty * Number(i.unit_price_pcc) } : i));
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.total_pcc || 0), 0);

  return (
    <CartContext.Provider value={{ club, items, setCartClub, addItem, updateQty, removeItem, clear, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
