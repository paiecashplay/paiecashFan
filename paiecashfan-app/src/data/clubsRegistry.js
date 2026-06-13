// ============================================================
// Registry global de tous les clubs / sélections nationales accessibles
// via /clubs/:slug. Indexé par slug calculé depuis le nom.
//
// Sources de données :
//  • Ligues clubs (Ligue 1, Premier League, etc.) → leagues.js
//  • Sélections nationales par confédération     → {caf|uefa|conmebol|concacaf|afc}-members.js
// ============================================================

import { ligue1, championsEurope, otherSports } from './leagues';
import { cafMembers }      from './caf-members';
import { uefaMembers }     from './uefa-members';
import { conmebolMembers } from './conmebol-members';
import { concacafMembers } from './concacaf-members';
import { afcMembers }      from './afc-members';
import { nbcPremier, zanzibarFederation } from './tanzania-clubs';
import { getClubProfile }  from './clubProfiles';
import { slugify }         from '@/lib/slugify';

// Normalise un club de Ligue/Sport vers la shape commune.
function fromLeagueClub(club, league) {
  return {
    slug:         slugify(club.name),
    name:         club.name,
    code:         club.id?.toUpperCase() || '',
    type:         'club',
    sport:        league.id === 'rugby' ? 'rugby' : league.id === 'basket' ? 'basket' : 'football',
    league:       league.name,
    leagueShort:  league.name.replace(/^.*\s/, '') || league.name,
    country:      league.country,
    countryFlag:  league.flag,
    city:         club.city,
    logo:         club.logo,
    primaryColor: club.primaryColor,
    accentColor:  club.primaryColor,
    founded:      null,
    stadium:      null,
    manager:      null,
    motto:        null
  };
}

// Normalise un membre fédération (équipe nationale) vers la shape commune.
function fromFederationMember(m, federationId) {
  return {
    slug:         slugify(m.nameFR || m.name),
    name:         m.nameFR || m.name,
    code:         m.code,
    type:         'national',
    sport:        'football',
    league:       federationId.toUpperCase(),
    leagueShort:  federationId.toUpperCase(),
    country:      m.nameFR || m.name,
    countryFlag:  m.flag,
    flagEmoji:    m.flag,
    logo:         m.logo,
    primaryColor: m.colors?.[0] || '#10b981',
    accentColor:  m.colors?.[1] || m.colors?.[0] || '#10b981',
    federation:   m.federation,
    president:    m.president,
    founded:      m.founded,
    fifaMember:   m.fifaMember,
    confederation: federationId.toUpperCase(),
    region:       m.region,
    motto:        null,
    stadium:      null,
    manager:      null
  };
}

// Construit l'index global. Les ligues sont énumérées d'abord pour que
// les clubs réels priment sur d'éventuels homonymes nationaux.
function buildRegistry() {
  const all = [];
  // Clubs de Ligue 1
  ligue1.clubs.forEach((c) => all.push(fromLeagueClub(c, ligue1)));
  // Clubs européens
  championsEurope.forEach((l) => l.clubs.forEach((c) => all.push(fromLeagueClub(c, l))));
  // Autres sports
  otherSports.forEach((l) => l.clubs.forEach((c) => all.push(fromLeagueClub(c, l))));
  // NBC Premier League (Tanzanie)
  nbcPremier.clubs.forEach((c) => all.push(fromLeagueClub(c, nbcPremier)));
  // Sélections nationales par confédération
  cafMembers.forEach((m)      => all.push(fromFederationMember(m, 'caf')));
  uefaMembers.forEach((m)     => all.push(fromFederationMember(m, 'uefa')));
  conmebolMembers.forEach((m) => all.push(fromFederationMember(m, 'conmebol')));
  concacafMembers.forEach((m) => all.push(fromFederationMember(m, 'concacaf')));
  afcMembers.forEach((m)      => all.push(fromFederationMember(m, 'afc')));
  // Fédération de Zanzibar (sélection nationale spéciale, membre associé CAF)
  all.push(fromFederationMember(zanzibarFederation, 'caf'));

  const bySlug = new Map();
  for (const club of all) {
    if (!club.slug) continue;
    // Premier arrivé = gagne (priorité aux clubs sport)
    if (!bySlug.has(club.slug)) bySlug.set(club.slug, club);
  }
  return bySlug;
}

const registry = buildRegistry();

export function findClubBySlug(slug) {
  const base = registry.get(slug);
  if (!base) return null;
  // Merge avec le profil détaillé si disponible (motto, founded, stadium,
  // coach, president, starPlayer, squad, image stade...)
  const profile = getClubProfile(slug);
  return profile ? { ...base, ...profile } : base;
}

export function allClubs() {
  return Array.from(registry.values());
}
