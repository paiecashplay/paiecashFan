// ============================================================
// CartContext — panier boutique GLOBAL (session, en mémoire).
// Rendu global pour un mini-panier en popup accessible depuis la navbar.
// Le checkout étant par club, le panier est rattaché à UN club : ouvrir la
// boutique d'un autre club repart d'un panier vide.
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
  const [open, setOpen] = useState(false);          // popup mini-panier
  const [checkoutOpen, setCheckoutOpen] = useState(false);  // grand modal de checkout
  const clubRef = useRef(null);

  // La boutique déclare son club. Changement de club → nouveau panier.
  const setCartClub = useCallback((c) => {
    if (!c || !c.slug) return;
    if (clubRef.current && clubRef.current.slug !== c.slug) setItems([]);
    clubRef.current = c;
    setClub(c);
  }, []);

  // item d'ajout : { productId, name, image, size, qty, unitPrice, unitPriceEur }
  const addItem = useCallback((it) => {
    const { productId, name = '', image = null, size = null, qty = 1, unitPrice = 0, unitPriceEur = 0 } = it || {};
    setItems((prev) => {
      const idx = prev.findIndex((i) => sameLine(i, productId, size));
      if (idx >= 0) {
        const next = [...prev];
        const q = next[idx].quantity + qty;
        next[idx] = { ...next[idx], quantity: q, total_pcc: q * Number(next[idx].unit_price_pcc), total_eur: q * Number(next[idx].unit_price_eur) };
        return next;
      }
      return [...prev, {
        id: `c-${seq++}`, product_id: productId, name, image, size: size || null,
        quantity: qty, unit_price_pcc: unitPrice, unit_price_eur: unitPriceEur,
        total_pcc: qty * unitPrice, total_eur: qty * unitPriceEur,
      }];
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => i.id === id
      ? { ...i, quantity: qty, total_pcc: qty * Number(i.unit_price_pcc), total_eur: qty * Number(i.unit_price_eur) }
      : i));
  }, []);

  const removeItem = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.total_pcc || 0), 0);
  const totalEur = items.reduce((s, i) => s + Number(i.total_eur || 0), 0);

  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);
  const toggleCart = useCallback(() => setOpen((v) => !v), []);

  // Ouvre le grand modal de checkout (et ferme la mini-popup).
  const openCheckout = useCallback(() => { setOpen(false); setCheckoutOpen(true); }, []);
  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  return (
    <CartContext.Provider value={{
      club, items, setCartClub, addItem, updateQty, removeItem, clear,
      totalItems, totalPrice, totalEur,
      open, openCart, closeCart, toggleCart,
      checkoutOpen, openCheckout, closeCheckout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
