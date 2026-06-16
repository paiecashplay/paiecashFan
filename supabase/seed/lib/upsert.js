// ─────────────────────────────────────────────────────────────
// Helpers pour upsert idempotent par slug + récupération d'UUID.
// ─────────────────────────────────────────────────────────────
import { supabase } from './client.js';

/**
 * Upsert d'un batch de rows sur une table donnée, conflict resolution
 * sur la colonne `conflictColumn` (typiquement 'slug'). Retourne les
 * rows après insertion/mise à jour.
 */
export async function upsertBy(table, rows, conflictColumn = 'slug') {
  if (rows.length === 0) return [];
  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictColumn })
    .select();
  if (error) {
    console.error(`  ❌  upsert ${table} failed:`, error.message);
    throw error;
  }
  return data || [];
}

/**
 * Récupère un id par son slug sur une table. Retourne null si absent.
 */
export async function findIdBySlug(table, slug) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id || null;
}

/**
 * Récupère tous les rows d'une table indexés par slug → id.
 * Pratique pour résoudre les FK avant d'insérer des players/products.
 */
export async function indexBySlug(table) {
  const { data, error } = await supabase
    .from(table)
    .select('id, slug');
  if (error) throw error;
  const map = new Map();
  for (const row of data || []) map.set(row.slug, row.id);
  return map;
}

/**
 * Supprime puis recrée toutes les rows d'une table où une colonne
 * matche une valeur. Utilisé pour replace-all des children d'un tenant
 * (players, trophies, products) avant de re-seed.
 */
export async function replaceChildren(table, parentColumn, parentId, rows) {
  await supabase.from(table).delete().eq(parentColumn, parentId);
  if (rows.length === 0) return [];
  const { data, error } = await supabase
    .from(table)
    .insert(rows.map((r) => ({ ...r, [parentColumn]: parentId })))
    .select();
  if (error) {
    console.error(`  ❌  insert ${table} (parent=${parentId}) failed:`, error.message);
    throw error;
  }
  return data || [];
}

export function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}
