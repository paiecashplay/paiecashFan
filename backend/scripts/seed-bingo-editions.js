// Seed / configure les éditions Sport Bingo pour coller à la maquette.
// Idempotent : met à jour si le slug existe, crée sinon. Remplit les matchs
// (24 en standard, 9 en express) si l'édition n'en a pas encore.
const bingo = require('../db/bingo');
const supabase = require('../db/supabase');

const H = 3600 * 1000;
const iso = (ms) => new Date(Date.now() + ms).toISOString();

// 24 matchs de démo (les 9 premiers servent au format express 3×3).
const MATCHES = [
  ['Paris FC', 'Madrid United'], ['London City', 'Milan Stars'], ['Munich Eagles', 'Lisbon Lions'],
  ['Barcelona Blue', 'Amsterdam AFC'], ['Turin Black', 'Dortmund Yellow'], ['Marseille Sud', 'Porto Dragons'],
  ['Manchester Red', 'Madrid Atlético'], ['Glasgow Celtic', 'Prague Sparta'], ['Brussels Union', 'Rome Capital'],
  ['Monaco Royal', 'Eindhoven PSV'], ['Naples Blue', 'Istanbul Lions'], ['Copenhagen FC', 'Athens Olympique'],
  ['Liverpool Mersey', 'Paris Saint'], ['Madrid Real', 'London Arsenal'], ['Milan Inter', 'Munich Bayern'],
  ['Benfica Lisbon', 'Barcelona Cat'], ['Dortmund Bor', 'Turin Juventus'], ['Amsterdam Ajax', 'Manchester City'],
  ['Porto FC', 'Marseille OM'], ['Rome Lazio', 'Glasgow Rangers'], ['Prague Slavia', 'Monaco AS'],
  ['Istanbul Galata', 'Naples Napoli'], ['Eindhoven PSV', 'Copenhagen FC'], ['Athens Pana', 'Brussels And'],
];

const EDITIONS = [
  { slug: 'champions-league-test', title: 'Spécial Ligue des Champions', subtitle: "Le meilleur de l'Europe", badge: 'Prestige', format: 'standard', difficulty: 'expert', status: 'live', reward: 500, cover: '/images/gaming/ligue-champions.webp', locksInH: 2, startedAgoH: 6 },
  { slug: 'premier-league', title: '100% Premier League', subtitle: 'Le football anglais', badge: null, format: 'standard', difficulty: 'standard', status: 'open', reward: 300, cover: '/images/gaming/premier-league.webp', locksInH: 13, startedAgoH: 4 },
  { slug: 'can-edition', title: 'CAN Édition', subtitle: 'Le football africain', badge: null, format: 'standard', difficulty: 'standard', status: 'open', reward: 400, cover: '/images/gaming/can.webp', locksInH: 23, startedAgoH: 3 },
  { slug: 'copa-libertadores', title: 'Copa Libertadores', subtitle: 'La passion sud-américaine', badge: null, format: 'standard', difficulty: 'expert', status: 'scheduled', reward: 450, cover: '/images/gaming/copa.webp', startsInH: 62 },
  { slug: 'classicos-week-end', title: 'Classicos du week-end', subtitle: 'Les plus grandes rivalités', badge: null, format: 'express', difficulty: 'expert', status: 'scheduled', reward: 250, cover: '/images/gaming/classicos-weekend.webp', startsInH: 30 },
  { slug: 'derbies-europeens', title: 'Derbies européens', subtitle: 'Choc & intensité', badge: null, format: 'standard', difficulty: 'standard', status: 'scheduled', reward: 300, cover: '/images/gaming/derbies-europeen.webp', startsInH: 18 },
];

(async () => {
  for (const e of EDITIONS) {
    const timing = e.status === 'scheduled'
      ? { startsAt: iso(e.startsInH * H), locksAt: iso((e.startsInH + 24) * H) }
      : { startsAt: iso(-(e.startedAgoH || 3) * H), locksAt: iso(e.locksInH * H) };

    const payload = {
      title: e.title, badge: e.badge, format: e.format, difficulty: e.difficulty, status: e.status,
      rewardPoints: e.reward, coverUrl: e.cover, theme: { subtitle: e.subtitle }, ...timing,
    };

    let edition = await bingo.getEditionBySlug(e.slug);
    if (edition) {
      edition = await bingo.updateEdition(edition.id, payload);
      console.log('MAJ  ', e.slug);
    } else {
      edition = await bingo.createEdition({ slug: e.slug, ...payload });
      console.log('CRÉÉ ', e.slug);
    }

    // Remplit les matchs si l'édition n'en a pas.
    const events = await bingo.listEvents(edition.id);
    if (events.length === 0) {
      const need = e.format === 'express' ? 9 : 24;
      const rows = MATCHES.slice(0, need).map(([home, away]) => ({ home, away }));
      const r = await bingo.bulkAddMatches(edition.id, rows);
      console.log('      +', r.created, 'matchs');
    } else {
      console.log('      (', events.length, 'événements déjà présents )');
    }
  }
  console.log('\n✅ Terminé.');
  process.exit(0);
})().catch((err) => { console.error('ERREUR', err.message); process.exit(1); });
