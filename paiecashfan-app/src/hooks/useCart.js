// ============================================================
// useCart(tenantId)
//
// Panier d'un club. Deux modes transparents pour l'UI :
//   • PERSISTÉ — si l'utilisateur est connecté ET que tenantId est un
//     vrai UUID de club : le panier vit en base (orders status='cart'
//     + order_items), sécurisé par RLS (auth.uid()).
//   • LOCAL — sinon (invité, ou club statique sans tenant en base) :
//     panier en mémoire, même interface, perdu au refresh.
//
// Shape d'un item exposé (aligné sur order_items) :
//   { id, product_id, size, quantity, unit_price_pcc, total_pcc }
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);

// id local pour le mode mémoire
let localSeq = 1;
const nextLocalId = () => `local-${localSeq++}`;

export function useCart(tenantId) {
  const { user } = useAuth();
  const persisted = Boolean(user && isUuid(tenantId));

  const [cartId, setCartId] = useState(null);
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── Chargement (mode persisté) ────────────────────────────────
  const load = useCallback(async () => {
    if (!persisted) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_items(id, product_id, size, quantity, unit_price_pcc, total_pcc)')
      .eq('user_id', user.id)
      .eq('tenant_id', tenantId)
      .eq('status', 'cart')
      .maybeSingle();
    if (!error && data) {
      setCartId(data.id);
      setItems(data.order_items || []);
    } else {
      setCartId(null);
      setItems([]);
    }
    setLoading(false);
  }, [persisted, user, tenantId]);

  useEffect(() => {
    // Reset à chaque changement de contexte (club / user)
    setCartId(null);
    setItems([]);
    if (persisted) load();
  }, [persisted, load]);

  // ─── Helpers persistés ─────────────────────────────────────────
  async function ensureCart() {
    if (cartId) return cartId;
    const { data, error } = await supabase
      .from('orders')
      .insert({ user_id: user.id, tenant_id: tenantId, status: 'cart', total_pcc: 0 })
      .select('id')
      .single();
    if (error) throw error;
    setCartId(data.id);
    return data.id;
  }

  async function recomputeTotal(oid) {
    const { data } = await supabase.from('order_items').select('total_pcc').eq('order_id', oid);
    const total = (data || []).reduce((s, i) => s + Number(i.total_pcc || 0), 0);
    await supabase.from('orders').update({ total_pcc: total }).eq('id', oid);
  }

  // ─── Actions (API commune aux 2 modes) ─────────────────────────
  async function addItem({ productId, size = null, qty = 1, unitPrice = 0 }) {
    const existing = items.find((i) => i.product_id === productId && (i.size || null) === (size || null));

    if (!persisted) {
      setItems((prev) => {
        const idx = prev.findIndex((i) => i.product_id === productId && (i.size || null) === (size || null));
        if (idx >= 0) {
          const next = [...prev];
          const q = next[idx].quantity + qty;
          next[idx] = { ...next[idx], quantity: q, total_pcc: q * unitPrice };
          return next;
        }
        return [...prev, { id: nextLocalId(), product_id: productId, size: size || null, quantity: qty, unit_price_pcc: unitPrice, total_pcc: qty * unitPrice }];
      });
      return;
    }

    const oid = await ensureCart();
    if (existing) {
      const q = existing.quantity + qty;
      await supabase.from('order_items').update({ quantity: q, total_pcc: q * Number(existing.unit_price_pcc) }).eq('id', existing.id);
    } else {
      await supabase.from('order_items').insert({
        order_id: oid, product_id: productId, size: size || null,
        quantity: qty, unit_price_pcc: unitPrice, total_pcc: qty * unitPrice
      });
    }
    await recomputeTotal(oid);
    await load();
  }

  async function updateQty(itemId, qty) {
    const it = items.find((i) => i.id === itemId);
    if (!it || qty < 1) return;

    if (!persisted) {
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, quantity: qty, total_pcc: qty * Number(i.unit_price_pcc) } : i));
      return;
    }
    await supabase.from('order_items').update({ quantity: qty, total_pcc: qty * Number(it.unit_price_pcc) }).eq('id', itemId);
    await recomputeTotal(cartId);
    await load();
  }

  async function removeItem(itemId) {
    if (!persisted) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    await supabase.from('order_items').delete().eq('id', itemId);
    await recomputeTotal(cartId);
    await load();
  }

  async function clear() {
    if (!persisted) { setItems([]); return; }
    if (!cartId) return;
    await supabase.from('order_items').delete().eq('order_id', cartId);
    await supabase.from('orders').update({ total_pcc: 0 }).eq('id', cartId);
    await load();
  }

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + Number(i.total_pcc || 0), 0);

  return {
    items, cartId, loading, persisted,
    addItem, updateQty, removeItem, clear,
    totalItems, totalPrice,
    isAuthed: Boolean(user)
  };
}
