import { Container } from './ui/Container';

const columns = [
  {
    title: 'Plateforme',
    links: ['Co-streaming', 'Boutiques clubs', 'Tombola & Loto', 'Fan club', 'Cartes prépayées', 'eSIM']
  },
  {
    title: 'Découvrir',
    links: ['Fédérations', 'Clubs Ligue 1', 'Clubs européens', 'Football africain', 'Autres sports', 'Évènements']
  },
  {
    title: 'Support',
    links: ['Aide', 'Contact', 'Statut', 'CGU', 'Confidentialité']
  }
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950 mt-12">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-gradient-hero shadow-glow-emerald grid place-items-center text-[11px] font-black text-white font-display">
                P
              </span>
              <span className="font-display text-xl font-bold text-bone-50">
                PaieCash<span className="text-emerald-400">Fan</span>
              </span>
            </div>
            <p className="mt-5 max-w-sm text-sm text-bone-400 leading-relaxed">
              La plateforme premium des fans de foot. Connectez-vous à votre équipe préférée.
              Cartes prépayées, eSIM, boutiques officielles, tombola live.
            </p>
            <div className="mt-6 flex gap-2">
              <Social label="X" />
              <Social label="IG" />
              <Social label="TT" />
              <Social label="YT" />
            </div>
          </div>

          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-bone-400">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-bone-200 hover:text-emerald-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold">
          <div>© 2026 PaieCashFan · Tous droits réservés</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tous les services opérationnels
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function Social({ label }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-bone-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
    >
      {label}
    </a>
  );
}
