// ═══════════════════════════════════════════════════════════════
// db/tombola.js — Tombola : campagnes + tickets + tirage (Supabase)
// Tables : tombola_campaigns, tombola_tickets. Paiement des tickets =
// PaieCashCoin (voir la route). Tirage auto à ends_at (voir le job).
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const { createNotification } = require('./notifications');
const favorites = require('./favorites');

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Nombre de tickets vendus pour une campagne (somme des quantités).
async function ticketsSold(campaignId) {
  const { data } = await supabase.from('tombola_tickets').select('quantity').eq('campaign_id', campaignId);
  return (data || []).reduce((s, t) => s + Number(t.quantity || 0), 0);
}

// Enrichit une campagne : tickets vendus + nom/logo du club.
async function enrich(c) {
  if (!c) return null;
  const sold = await ticketsSold(c.id);
  let club = null;
  if (c.tenant_id) {
    const { data } = await supabase.from('tenants').select('name, slug, logo_url').eq('id', c.tenant_id).maybeSingle();
    club = data || null;
  }
  let winnerName = null;
  if (c.winner_user_id) {
    const { data } = await supabase.from('profiles').select('display_name').eq('id', c.winner_user_id).maybeSingle();
    winnerName = data?.display_name || 'Supporter';
  }
  return {
    winnerName,
    id: c.id,
    tenantId: c.tenant_id,
    clubName: club?.name || null,
    clubSlug: club?.slug || null,
    clubLogo: club?.logo_url || null,
    title: c.title,
    description: c.description,
    prizeLabel: c.prize_label,
    imageUrl: c.image_url,
    ticketPricePcc: Number(c.ticket_price_pcc || 0),
    ticketsTotal: c.tickets_total,
    ticketsSold: sold,
    startsAt: c.starts_at,
    endsAt: c.ends_at,
    status: c.status,
    winnerUserId: c.winner_user_id,
    drawnAt: c.drawn_at,
  };
}

// Liste des campagnes (filtres optionnels). scope: 'active' → en cours.
async function listCampaigns({ status, tenantId, includeAll } = {}) {
  let q = supabase.from('tombola_campaigns').select('*').order('ends_at', { ascending: true });
  if (status) q = q.eq('status', status);
  if (tenantId !== undefined) q = tenantId === null ? q.is('tenant_id', null) : q.eq('tenant_id', tenantId);
  if (!includeAll && !status) q = q.in('status', ['active', 'closed', 'drawn']);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return Promise.all((data || []).map(enrich));
}

async function getCampaignRaw(id) {
  const { data } = await supabase.from('tombola_campaigns').select('*').eq('id', id).maybeSingle();
  return data || null;
}

async function getCampaign(id, userId = null) {
  const raw = await getCampaignRaw(id);
  if (!raw) return null;
  const c = await enrich(raw);
  if (userId) {
    const { data } = await supabase.from('tombola_tickets').select('quantity').eq('campaign_id', id).eq('user_id', userId);
    c.myTickets = (data || []).reduce((s, t) => s + Number(t.quantity || 0), 0);
  }
  return c;
}

async function createCampaign(data) {
  const payload = {
    tenant_id: data.tenantId || null,
    title: data.title,
    description: data.description || null,
    prize_label: data.prizeLabel || null,
    image_url: data.imageUrl || null,
    ticket_price_pcc: round2(data.ticketPricePcc),
    tickets_total: data.ticketsTotal != null ? parseInt(data.ticketsTotal, 10) : null,
    starts_at: data.startsAt || new Date().toISOString(),
    ends_at: data.endsAt,
    status: data.status || 'active',
    created_by: data.createdBy || null,
  };
  const { data: row, error } = await supabase.from('tombola_campaigns').insert(payload).select('*').single();
  if (error) throw new Error(error.message);
  await notifyClubFollowers(row).catch(() => {});   // best-effort, non bloquant
  return enrich(row);
}

// Notifie les fans qui ont ce club en favori (⭐) qu'une tombola est lancée.
async function notifyClubFollowers(campaign) {
  if (!campaign?.tenant_id || campaign.status !== 'active') return;
  const followers = await favorites.followersOfClub(campaign.tenant_id);
  if (!followers.length) return;
  const { data: club } = await supabase.from('tenants').select('name').eq('id', campaign.tenant_id).maybeSingle();
  const lot = campaign.prize_label || campaign.title;
  const clubName = club?.name || 'ton club';
  for (const userId of followers) {
    await createNotification({
      user_id: userId, type: 'tombola_new',
      title: `🎁 Nouvelle tombola : ${clubName}`,
      message: `« ${lot} » vient d'être lancée. Tente ta chance dès maintenant !`,
      metadata: { campaignId: campaign.id, tenantId: campaign.tenant_id, link: '/tombola' },
    }).catch(() => {});
  }
}

async function updateCampaign(id, updates) {
  const allowed = {};
  const map = { title: 'title', description: 'description', prizeLabel: 'prize_label', imageUrl: 'image_url',
    ticketPricePcc: 'ticket_price_pcc', ticketsTotal: 'tickets_total', startsAt: 'starts_at', endsAt: 'ends_at', status: 'status' };
  for (const [k, col] of Object.entries(map)) if (updates[k] !== undefined) allowed[col] = updates[k];
  allowed.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('tombola_campaigns').update(allowed).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return enrich(data);
}

async function deleteCampaign(id) {
  const { error } = await supabase.from('tombola_campaigns').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// Enregistre un achat de tickets (après paiement confirmé).
async function recordTickets({ campaignId, userId, quantity, totalPcc, reference }) {
  const { data, error } = await supabase.from('tombola_tickets')
    .insert({ campaign_id: campaignId, user_id: userId, quantity, total_pcc: round2(totalPcc), reference: reference || null })
    .select('id').single();
  if (error) throw new Error(error.message);
  return data.id;
}

// Campagnes 'active' dont ends_at est dépassé (pour le tirage auto).
async function campaignsDueForDraw() {
  const { data } = await supabase.from('tombola_campaigns').select('*')
    .eq('status', 'active').lte('ends_at', new Date().toISOString());
  return data || [];
}

// Tire un gagnant au hasard (pondéré par le nombre de tickets). Idempotent :
// ne tire que si la campagne est encore 'active'.
async function drawWinner(campaignId) {
  const raw = await getCampaignRaw(campaignId);
  if (!raw || raw.status !== 'active') return { drawn: false, reason: 'not_active' };

  const { data: tickets } = await supabase.from('tombola_tickets').select('id, user_id, quantity').eq('campaign_id', campaignId);
  if (!tickets || !tickets.length) {
    await supabase.from('tombola_campaigns').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', campaignId);
    return { drawn: false, reason: 'no_tickets' };
  }

  // Pool pondéré par quantité.
  const pool = [];
  for (const t of tickets) for (let i = 0; i < Number(t.quantity || 0); i++) pool.push(t);
  const pick = pool[Math.floor(Math.random() * pool.length)];

  await supabase.from('tombola_campaigns').update({
    status: 'drawn', winner_user_id: pick.user_id, winner_ticket_id: pick.id,
    drawn_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', campaignId).eq('status', 'active'); // garde-fou idempotent

  // Notifie le gagnant (best-effort, non bloquant).
  const lot = raw.prize_label || raw.title;
  await createNotification({
    user_id: pick.user_id, type: 'tombola_win', title: `🎉 Tu as gagné : ${lot} !`,
    message: `Félicitations ! Ton ticket a été tiré au sort pour « ${lot} ». On te recontacte pour la remise du lot.`,
    metadata: { campaignId, link: '/tombola' },
  }).catch(() => {});

  return { drawn: true, winnerUserId: pick.user_id, ticketId: pick.id };
}

module.exports = {
  listCampaigns, getCampaign, getCampaignRaw, ticketsSold,
  createCampaign, updateCampaign, deleteCampaign,
  recordTickets, campaignsDueForDraw, drawWinner,
};
