// ============================================================
// Profils détaillés pour chaque club (override des données de base
// venant de leagues.js / federation members).
//
// Indexés par slug calculé via slugify(club.name).
// Chaque profil peut fournir : motto, mottoColor, founded, stadium,
// stadiumImage, coach, president, starPlayer, squad.
//
// Si un club n'a pas de profil ici, la page club utilise les fallbacks
// génériques (image stade par défaut, pas de Star Player / Squad).
// ============================================================

export const clubProfiles = {
  // ────────────────────────────────────────────────────────────
  // Paris Saint-Germain — Ligue 1
  // ────────────────────────────────────────────────────────────
  'paris-saint-germain': {
    motto: 'Ici c\'est Paris',
    mottoColor: '#DC2626',            // rouge PSG
    founded: 1970,
    stadium: 'Parc des Princes',
    stadiumImage: '/images/clubs/psg-stadium.jpg', // poser le fichier ici
    coach: 'Luis Enrique',
    president: 'Nasser Al-Khelaïfi',
    starPlayer: {
      number: 10,
      name: 'Ousmane Dembélé',
      position: 'Attaquant',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Ousmane_Demb%C3%A9l%C3%A9_2018.jpg/400px-Ousmane_Demb%C3%A9l%C3%A9_2018.jpg',
      stats: { goals: 33, assists: 14 }
    },
    squad: [
      { number: 1,  name: 'Gianluigi Donnarumma', position: 'Gardien',     country: 'IT' },
      { number: 5,  name: 'Marquinhos',           position: 'Défenseur',   country: 'BR' },
      { number: 6,  name: 'Willian Pacho',        position: 'Défenseur',   country: 'EC' },
      { number: 21, name: 'Lucas Hernandez',      position: 'Défenseur',   country: 'FR' },
      { number: 25, name: 'Nuno Mendes',          position: 'Défenseur',   country: 'PT' },
      { number: 8,  name: 'Fabián Ruiz',          position: 'Milieu',      country: 'ES' },
      { number: 17, name: 'Vitinha',              position: 'Milieu',      country: 'PT' },
      { number: 33, name: 'Warren Zaïre-Emery',   position: 'Milieu',      country: 'FR' },
      { number: 14, name: 'Désiré Doué',          position: 'Milieu',      country: 'FR' },
      { number: 10, name: 'Ousmane Dembélé',      position: 'Attaquant',   country: 'FR' },
      { number: 9,  name: 'Gonçalo Ramos',        position: 'Attaquant',   country: 'PT' },
      { number: 7,  name: 'Bradley Barcola',      position: 'Attaquant',   country: 'FR' }
    ]
  }

  // À étendre pour les autres clubs : Olympique de Marseille, Lyon, Monaco,
  // FC Barcelona, Real Madrid, Bayern Munich, Liverpool, etc.
  // Pattern : ajouter une entrée { slug → profil } et la page club
  // se mettra automatiquement à jour.
};

// Helper : récupère le profil d'un club (peut être null).
export function getClubProfile(slug) {
  return clubProfiles[slug] || null;
}
