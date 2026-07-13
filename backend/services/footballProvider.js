// ═══════════════════════════════════════════════════════════════
// services/footballProvider.js — Abstraction fournisseur de données foot.
// Le back ne dépend JAMAIS d'une API externe en dur : il passe par ce
// provider. On branche ensuite API-Football / SportMonks via un adaptateur
// respectant la même interface. Clés API côté serveur uniquement.
//
// Interface :
//   getCompetitions()             -> Competition[]
//   getFixtures({ competition })  -> Fixture[]
//   getFixture(id)                -> Fixture
//   getLiveFixtures(ids)          -> Fixture[]
//   getResults(ids)              -> FixtureResult[]
// ═══════════════════════════════════════════════════════════════

// ── Données de démonstration (MVP, saisie manuelle des vrais résultats) ──
const DEMO_COMPETITIONS = [
  { id: 'cl', name: 'Ligue des Champions', country: 'Europe' },
  { id: 'pl', name: 'Premier League', country: 'Angleterre' },
  { id: 'l1', name: 'Ligue 1', country: 'France' },
  { id: 'liga', name: 'La Liga', country: 'Espagne' },
  { id: 'seriea', name: 'Serie A', country: 'Italie' },
];

const DEMO_FIXTURES = {
  cl: [
    { id: 'cl-1', competition: 'Ligue des Champions', home: 'Real Madrid', away: 'Manchester City', startsAt: null },
    { id: 'cl-2', competition: 'Ligue des Champions', home: 'Bayern Munich', away: 'PSG', startsAt: null },
  ],
  l1: [
    { id: 'l1-1', competition: 'Ligue 1', home: 'Paris Saint-Germain', away: 'Olympique de Marseille', startsAt: null },
    { id: 'l1-2', competition: 'Ligue 1', home: 'Olympique Lyonnais', away: 'Nice', startsAt: null },
  ],
};

class MockFootballDataProvider {
  async getCompetitions() { return DEMO_COMPETITIONS; }
  async getFixtures({ competition } = {}) {
    if (competition && DEMO_FIXTURES[competition]) return DEMO_FIXTURES[competition];
    return Object.values(DEMO_FIXTURES).flat();
  }
  async getFixture(id) {
    return Object.values(DEMO_FIXTURES).flat().find((f) => f.id === id) || null;
  }
  async getLiveFixtures() { return []; }        // pas de live en mock
  async getResults() { return []; }             // résultats saisis manuellement (MVP)
}

// Sélection du provider (mock pour le MVP ; branchement API-Football ensuite
// via FOOTBALL_PROVIDER=apifootball + un adaptateur dédié).
let _provider = null;
function getFootballProvider() {
  if (_provider) return _provider;
  // const kind = (process.env.FOOTBALL_PROVIDER || 'mock').toLowerCase();
  // if (kind === 'apifootball') _provider = new ApiFootballDataProvider();
  _provider = new MockFootballDataProvider();
  return _provider;
}

module.exports = { getFootballProvider, MockFootballDataProvider };
