import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/cn';
import { ligue1, championsEurope } from '@/data/leagues';
import { federations } from '@/data/federations';

// Index plat de tous les items cherchables (clubs + ligues + fédérations)
function buildSearchIndex() {
  const items = [];
  [ligue1, ...championsEurope].forEach((league) => {
    items.push({
      type: 'league',
      id: `league-${league.id}`,
      label: league.name,
      sub: league.country,
      flag: league.flag
    });
    league.clubs.forEach((c) => {
      items.push({
        type: 'club',
        id: `club-${c.id}`,
        label: c.name,
        sub: `${c.city} · ${league.name}`,
        color: c.primaryColor,
        logo: c.logo
      });
    });
  });
  federations.forEach((f) => {
    items.push({
      type: 'federation',
      id: `fed-${f.id}`,
      label: f.code,
      sub: `${f.shortName} · ${f.region}`,
      flag: f.flag
    });
  });
  return items;
}

const allItems = buildSearchIndex();

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allItems
      .filter((it) => it.label.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className={cn(
        'glass-strong rounded-full flex items-center pl-6 pr-2 h-16',
        'transition-shadow duration-300',
        open && query ? 'shadow-glow-indigo' : 'shadow-glow-indigo/30'
      )}>
        <Search size={18} className="text-bone-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une équipe, un club, une fédération…"
          className="flex-1 bg-transparent border-0 outline-none px-4 text-bone-100 placeholder:text-bone-500 text-base"
        />
        <Button size="md" className="shrink-0">
          Chercher
          <ArrowRight size={16} />
        </Button>
      </div>

      <AnimatePresence>
        {open && query && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] glass-strong rounded-2xl overflow-hidden border border-white/10 max-h-[420px] overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="px-5 py-8 text-center text-bone-400 text-sm">
                <Sparkles size={16} className="mx-auto mb-2 opacity-60" />
                Aucun résultat pour "<span className="text-bone-200">{query}</span>"
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {results.map((it) => (
                  <li key={it.id}>
                    <button
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors text-left"
                      onClick={() => { setQuery(it.label); setOpen(false); }}
                    >
                      <ResultIcon item={it} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-bone-100 truncate">{it.label}</div>
                        <div className="text-xs text-bone-400 truncate">{it.sub}</div>
                      </div>
                      <TypeBadge type={it.type} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultIcon({ item }) {
  if (item.type === 'club' && item.logo) {
    return (
      <span
        className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 overflow-hidden"
        style={{ borderColor: `${item.color}44` }}
      >
        <img src={item.logo} alt="" className="h-7 w-7 object-contain" loading="lazy" />
      </span>
    );
  }
  return (
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-xl">
      {item.flag || '🏟'}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    club:       { label: 'Club',       cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
    league:     { label: 'Ligue',      cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
    federation: { label: 'Fédération', cls: 'bg-gold-500/15 text-gold-400 border-gold-500/30' }
  };
  const m = map[type] || map.club;
  return (
    <span className={cn(
      'shrink-0 text-[9px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded-full border',
      m.cls
    )}>
      {m.label}
    </span>
  );
}
