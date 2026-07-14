// Tests Sport Bingo — disponibilité & participation.
// Lancer : node tests/bingoAvailability.test.js
const assert = require('assert');
const { getEditionAvailability, isVisibleOnMain, isPlayable } = require('../services/bingoAvailability');

const now = new Date('2026-07-14T12:00:00Z');
const past = '2026-07-14T10:00:00Z';   // avant `now`
const future = '2026-07-14T14:00:00Z'; // après `now`
const ed = (o) => ({ status: 'open', starts_at: null, locks_at: null, ...o });

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('  ✓', name); };

console.log('getEditionAvailability');
// 1. open avant clôture → playable
t('open avant clôture → playable', () => assert.equal(getEditionAvailability(ed({ status: 'open', starts_at: past, locks_at: future }), now), 'playable'));
// 2. open après clôture → locked (les DATES protègent, même si status=open)
t('open après clôture → locked', () => assert.equal(getEditionAvailability(ed({ status: 'open', starts_at: past, locks_at: past }), now), 'locked'));
// 2b. open avant ouverture → upcoming
t('open avant ouverture → upcoming', () => assert.equal(getEditionAvailability(ed({ status: 'open', starts_at: future, locks_at: future }), now), 'upcoming'));
// 3. scheduled avant ouverture → upcoming
t('scheduled → upcoming', () => assert.equal(getEditionAvailability(ed({ status: 'scheduled', starts_at: future }), now), 'upcoming'));
// 4. completed → completed (et non visible sur la page principale)
t('completed → completed', () => { const a = getEditionAvailability(ed({ status: 'completed' }), now); assert.equal(a, 'completed'); assert.equal(isVisibleOnMain(a), false); });
// 5. cancelled → cancelled (non visible)
t('cancelled → cancelled', () => { const a = getEditionAvailability(ed({ status: 'cancelled' }), now); assert.equal(a, 'cancelled'); assert.equal(isVisibleOnMain(a), false); });
// 6/7. live → live (le contrôle "carte requise" est côté front)
t('live → live (visible sur main, filtré par carte au front)', () => { const a = getEditionAvailability(ed({ status: 'live', locks_at: past }), now); assert.equal(a, 'live'); assert.equal(isVisibleOnMain(a), true); });
// 8. draft → draft (jamais visible)
t('draft → draft (non visible)', () => { const a = getEditionAvailability(ed({ status: 'draft' }), now); assert.equal(a, 'draft'); assert.equal(isVisibleOnMain(a), false); });
// calculating
t('calculating → calculating', () => assert.equal(getEditionAvailability(ed({ status: 'calculating' }), now), 'calculating'));
// 10/11. l'heure passée en paramètre (SERVEUR) décide — pas le fuseau navigateur
t('heure serveur décide (playable maintenant, locked plus tard)', () => {
  const e = ed({ status: 'open', starts_at: past, locks_at: '2026-07-14T13:00:00Z' });
  assert.equal(getEditionAvailability(e, new Date('2026-07-14T12:30:00Z')), 'playable');
  assert.equal(getEditionAvailability(e, new Date('2026-07-14T13:30:00Z')), 'locked');
});
// 12. isPlayable ne vaut que pour 'playable'
t('isPlayable strict', () => { assert.equal(isPlayable('playable'), true); ['upcoming', 'locked', 'live', 'completed', 'cancelled'].forEach((a) => assert.equal(isPlayable(a), false)); });

// ── Garde participation (contre la vraie base, lecture seule) ──
(async () => {
  try {
    const bingo = require('../db/bingo');
    console.log('\ncanParticipateInEdition (base réelle)');
    const r0 = await bingo.canParticipateInEdition(null, 'whatever');
    t('non authentifié → NOT_AUTHENTICATED', () => assert.equal(r0.reason, 'NOT_AUTHENTICATED'));

    const supabase = require('../db/supabase');
    const { data: eds } = await supabase.from('bingo_editions').select('id, slug, status, starts_at, locks_at');
    const FAKE = '00000000-0000-0000-0000-000000000000';
    for (const e of eds || []) {
      const avail = getEditionAvailability(e);
      const r = await bingo.canParticipateInEdition(FAKE, e.id);
      if (avail === 'playable') t(`${e.slug} (playable) → autorisé`, () => assert.equal(r.allowed, true));
      else if (avail === 'upcoming') t(`${e.slug} (upcoming) → NOT_STARTED`, () => assert.equal(r.reason, 'NOT_STARTED'));
      else if (avail === 'locked') t(`${e.slug} (locked) → REGISTRATION_CLOSED`, () => assert.equal(r.reason, 'REGISTRATION_CLOSED'));
      else t(`${e.slug} (${avail}) → refusé`, () => assert.equal(r.allowed, false));
    }
    console.log(`\n✅ ${passed} tests OK`);
    process.exit(0);
  } catch (err) { console.error('\n❌ ÉCHEC:', err.message); process.exit(1); }
})();
