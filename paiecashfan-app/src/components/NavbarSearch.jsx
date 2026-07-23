import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import { ligue1, championsEurope } from '@/data/leagues';
import { federations } from '@/data/federations';

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
  });

  federations.forEach((federation) => {
    items.push({
      type: 'federation',
      id: `fed-${federation.id}`,
      slug: federation.id,
      label: federation.code,
      sub: `${federation.shortName} · ${federation.region}`,
      flag: federation.flag
    });
  });

  return items;
}

const staticItems = buildSearchIndex();

export function NavbarSearch({
  open,
  onClose
}) {
  const [query, setQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQuery('');
      setApiResults([]);
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    const cleanQuery = query.trim();

    if (cleanQuery.length < 2) {
      setApiResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const json = await apiFetch(
          `/api/v2/marketplace/search?q=${encodeURIComponent(cleanQuery)}`
        );

        if (!cancelled) {
          setApiResults(json?.data?.results || []);
        }
      } catch (error) {
        console.error(
          'Erreur lors de la recherche Navbar :',
          error
        );

        if (!cancelled) {
          setApiResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  const results = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return [];

    const staticMatches = staticItems.filter((item) => {
      const label = item.label?.toLowerCase() || '';
      const sub = item.sub?.toLowerCase() || '';

      return (
        label.includes(cleanQuery) ||
        sub.includes(cleanQuery)
      );
    });

    const seen = new Set();
    const merged = [];

    for (const item of [
      ...apiResults,
      ...staticMatches
    ]) {
      const uniqueValue = item.productId || item.slug || item.id || item.label || '';
      const key = `${item.type}:${String(uniqueValue).toLowerCase()}`;

      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(item);
    }

    return merged.slice(0, 15);
  }, [apiResults, query]);

  function handleSelect(item) {
    onClose();

    if (item.type === 'club' && item.slug) {
      navigate(`/clubs/${item.slug}`);
      return;
    }

    if (
      item.type === 'federation' &&
      item.slug
    ) {
      navigate(`/federations/${item.slug}`);
      return;
    }

    if (item.type === 'product' && item.clubSlug) {
      navigate(`/clubs/${item.clubSlug}#merchandise`, {
        state: {selectedProductId: item.productId}
      });
      return;
    }

    if (item.type === 'league') {
      setQuery(item.label);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-ink-950/85 px-4 pt-20 backdrop-blur-md sm:pt-28"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
              y: -12
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.97,
              y: -12
            }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 p-4 sm:p-5">
              <Search
                size={18}
                className="shrink-0 text-emerald-400"
              />

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Rechercher un club ou une fédération ou un produit…"
                className="min-w-0 flex-1 bg-transparent text-sm text-bone-100 outline-none placeholder:text-bone-500 sm:text-base"
              />

              {loading && (
                <Loader2
                  size={17}
                  className="shrink-0 animate-spin text-emerald-400"
                />
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la recherche"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-bone-400 transition hover:bg-white/5 hover:text-bone-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto">
              {query.trim().length < 2 ? (
                <div className="px-5 py-12 text-center">
                  <Search
                    size={30}
                    className="mx-auto text-bone-600"
                  />

                  <p className="mt-4 text-sm font-semibold text-bone-300">
                    Commencez votre recherche
                  </p>

                  <p className="mt-1 text-xs text-bone-500">
                    Saisissez au moins deux caractères.
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  {loading ? (
                    <>
                      <Loader2
                        size={22}
                        className="mx-auto animate-spin text-emerald-400"
                      />

                      <p className="mt-3 text-sm text-bone-400">
                        Recherche en cours…
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles
                        size={24}
                        className="mx-auto text-bone-600"
                      />

                      <p className="mt-3 text-sm font-semibold text-bone-300">
                        Aucun résultat
                      </p>

                      <p className="mt-1 text-xs text-bone-500">
                        Aucun club ou aucune fédération ou aucun produit ne correspond à «{' '}
                        <span className="text-bone-300">
                          {query}
                        </span>
                        ».
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {results.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelect(item)
                        }
                        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/5 sm:px-5"
                      >
                        <ResultIcon item={item} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-bone-100">
                            {item.label}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-bone-400">
                            {item.sub}
                          </p>
                        </div>

                        <TypeBadge type={item.type} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultIcon({ item }) {
  if (item.logo) {
    return (
      <span
        className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5"
        style={
          item.color
            ? {
                borderColor: `${item.color}44`
              }
            : undefined
        }
      >
        <img
          src={item.logo}
          alt=""
          className="h-8 w-8 object-contain"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display =
              'none';
          }}
        />
      </span>
    );
  }

  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-xl">
      {item.flag || '🏟️'}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    club: {
      label: 'Club',
      className:
        'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
    },
    league: {
      label: 'Ligue',
      className:
        'border-cyan-500/30 bg-cyan-500/15 text-cyan-300'
    },
    federation: {
      label: 'Fédération',
      className:
        'border-amber-500/30 bg-amber-500/15 text-amber-300'
    },
    product: {
      label: 'Produit',
      className:
        'border-violet-500/30 bg-violet-500/15 text-violet-300'
    }

  };

  const metadata = map[type] || map.club;

  return (
    <span
      className={cn(
        'shrink-0 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-[0.14em]',
        metadata.className
      )}
    >
      {metadata.label}
    </span>
  );
}