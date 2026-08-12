// ═══════════════════════════════════════════════════════════════
// db/commissions.js — Registre des commissions plateforme (ventes de
// produits globaux type Aivora). Chaque ligne = 10% reversé à un club.
// Accès service-role (RLS deny-all sur platform_commissions).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');

async function recordCommission(data) {
  const row = {
    order_id: data.orderId || null,
    club_tenant_id: data.clubTenantId || null,
    product_id: data.productId || null,
    buyer_user_id: data.buyerUserId || null,
    gross_pcc: data.grossPcc || 0,
    gross_eur: data.grossEur || 0,
    rate: data.rate ?? 10,
    commission_pcc: data.commissionPcc || 0,
    commission_eur: data.commissionEur || 0,
    pcc_reference: data.reference || null,
    status: data.status || 'paid',
  };
  const { data: saved, error } = await supabase
    .from('platform_commissions')
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(`recordCommission: ${error.message}`);
  return saved;
}

// Totaux par club (bénéficiaire) : montant reversé, en attente, nb de ventes.
async function summaryByClub() {
  const { data, error } = await supabase
    .from('platform_commissions')
    .select('club_tenant_id, commission_pcc, commission_eur, status, club:tenants!platform_commissions_club_tenant_id_fkey(id, name, slug, logo_url)');
  if (error) throw new Error(`summaryByClub: ${error.message}`);

  const byClub = new Map();
  for (const r of data || []) {
    const key = r.club_tenant_id || 'unknown';
    const agg = byClub.get(key) || {
      clubId: r.club_tenant_id,
      club: r.club || null,
      paidPcc: 0, paidEur: 0, pendingPcc: 0, pendingEur: 0, count: 0,
    };
    agg.count += 1;
    if (r.status === 'paid') { agg.paidPcc += Number(r.commission_pcc || 0); agg.paidEur += Number(r.commission_eur || 0); }
    else { agg.pendingPcc += Number(r.commission_pcc || 0); agg.pendingEur += Number(r.commission_eur || 0); }
    byClub.set(key, agg);
  }
  return [...byClub.values()].sort((a, b) => (b.paidPcc + b.pendingPcc) - (a.paidPcc + a.pendingPcc));
}

// Historique récent (lignes détaillées) pour la vue BO.
async function listCommissions({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('platform_commissions')
    .select('id, order_id, product_id, gross_pcc, rate, commission_pcc, commission_eur, pcc_reference, status, created_at, club:tenants!platform_commissions_club_tenant_id_fkey(name, slug), product:products(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`listCommissions: ${error.message}`);
  return data || [];
}

// Totaux globaux (bandeau récap).
async function totals() {
  const { data, error } = await supabase
    .from('platform_commissions')
    .select('commission_pcc, commission_eur, status');
  if (error) throw new Error(`commissionTotals: ${error.message}`);
  const t = { paidPcc: 0, pendingPcc: 0, count: (data || []).length };
  for (const r of data || []) {
    if (r.status === 'paid') t.paidPcc += Number(r.commission_pcc || 0);
    else t.pendingPcc += Number(r.commission_pcc || 0);
  }
  return t;
}

module.exports = { recordCommission, summaryByClub, listCommissions, totals };
