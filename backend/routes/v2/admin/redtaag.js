// ═══════════════════════════════════════════════════════════════
// routes/v2/admin/redtaag.js — Attribution des events Redtaag aux clubs
// (super-admin). Assigner un event à un club = importer ses tarifs comme
// offres billet (avec le mapping Redtaag) dans metadata.ticketing du club →
// la billetterie du club les affiche et l'achat émet le billet (déjà câblé).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const supabase = require('../../../db/supabase');
const redtaag = require('../../../services/redtaag');
const { requireAuth, requireRole } = require('../../../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('super_admin'));

const ok = (res, data) => res.json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) =>
  res.status(s).json({ success: false, data: null, error: msg });

// Retire les offres d'un event de tous les clubs qui les portent
// (sauf `keepTenantId`), en préservant les autres offres/abonnements.
async function removeEventOffersEverywhere(eventId, keepTenantId) {
  const { data: maps } = await supabase
    .from('redtaag_event_clubs')
    .select('tenant_id')
    .eq('redtaag_event_id', eventId);
  for (const m of maps || []) {
    if (keepTenantId && m.tenant_id === keepTenantId) continue;
    const { data: t } = await supabase
      .from('tenants').select('id, metadata').eq('id', m.tenant_id).single();
    if (!t) continue;
    const metadata = { ...(t.metadata || {}) };
    const tk = metadata.ticketing || {};
    if (Array.isArray(tk.tickets)) {
      tk.tickets = tk.tickets.filter(
        (o) => o?.redtaag?.event !== Number(eventId)
      );
      metadata.ticketing = tk;
      await supabase.from('tenants').update({ metadata }).eq('id', m.tenant_id);
    }
  }
}

// GET /api/v2/admin/redtaag/events → events Redtaag en vente + club assigné.
router.get('/events', async (req, res) => {
  try {
    if (!redtaag.isConfigured()) return fail(res, 'Redtaag non configuré.', 503);
    const events = await redtaag.eventsForSale();
    const { data: maps } = await supabase
      .from('redtaag_event_clubs').select('*');
    const byEvent = Object.fromEntries(
      (maps || []).map((m) => [String(m.redtaag_event_id), m])
    );
    const list = events.map((e) => {
      const d = e.data || {};
      const m = byEvent[String(e.id)] || null;
      return {
        id: String(e.id),
        title: d.titre || '',
        startSale: d.debut_vente || null,
        endSale: d.fin_vente || null,
        sold: Number(d.vendu) || 0,
        tenantId: m?.tenant_id || null,
        offerCount: m?.offer_count || 0,
      };
    });
    return ok(res, { events: list });
  } catch (err) {
    console.error('[admin/redtaag] events:', err.message);
    return fail(res, err.message, 500);
  }
});

// POST /api/v2/admin/redtaag/map { eventId, tenantId } → importe les tarifs.
router.post('/map', async (req, res) => {
  try {
    if (!redtaag.isConfigured()) return fail(res, 'Redtaag non configuré.', 503);
    const eventId = String(req.body?.eventId || '').trim();
    const tenantId = String(req.body?.tenantId || '').trim();
    if (!eventId || !tenantId) return fail(res, 'eventId et tenantId requis.');

    const offers = await redtaag.buildOffersFromEvent(eventId);
    if (!offers.length) {
      return fail(res, 'Aucun tarif vendable trouvé pour cet event.', 409);
    }

    // Réassignation : on retire d'abord ces offres de tout autre club.
    await removeEventOffersEverywhere(eventId, tenantId);

    const { data: t } = await supabase
      .from('tenants').select('id, name, metadata').eq('id', tenantId).single();
    if (!t) return fail(res, 'Club introuvable.', 404);

    const metadata = { ...(t.metadata || {}) };
    const tk = metadata.ticketing || {};
    const subs = Array.isArray(tk.subscriptions) ? tk.subscriptions : [];
    // On remplace les offres du MÊME event, en gardant les autres.
    const otherTickets = (Array.isArray(tk.tickets) ? tk.tickets : []).filter(
      (o) => o?.redtaag?.event !== Number(eventId)
    );
    metadata.ticketing = {
      subscriptions: subs,
      tickets: [...otherTickets, ...offers],
    };
    await supabase.from('tenants').update({ metadata }).eq('id', tenantId);

    const ev = (await redtaag.eventsForSale()).find(
      (e) => String(e.id) === eventId
    );
    await supabase.from('redtaag_event_clubs').upsert({
      redtaag_event_id: eventId,
      tenant_id: tenantId,
      title: ev?.data?.titre || null,
      offer_count: offers.length,
      updated_at: new Date().toISOString(),
    });

    return ok(res, { imported: offers.length, tenant: t.name });
  } catch (err) {
    console.error('[admin/redtaag] map:', err.message);
    return fail(res, err.message, 500);
  }
});

// DELETE /api/v2/admin/redtaag/map/:eventId → retire les offres du club.
router.delete('/map/:eventId', async (req, res) => {
  try {
    const eventId = String(req.params.eventId || '').trim();
    await removeEventOffersEverywhere(eventId, null);
    await supabase
      .from('redtaag_event_clubs').delete().eq('redtaag_event_id', eventId);
    return ok(res, { removed: true });
  } catch (err) {
    console.error('[admin/redtaag] unmap:', err.message);
    return fail(res, err.message, 500);
  }
});

module.exports = router;
