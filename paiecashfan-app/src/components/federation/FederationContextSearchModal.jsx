import { useMemo, useState } from 'react';
import {
  Search,
  X,
  UsersRound,
  Volleyball,
  ShoppingBag,
} from 'lucide-react';

export function FederationContextSearchModal({
  nationalTeams = {},
  clubs = [],
  products = [],
  primaryColor = '#10b981',
  onClose,
}) {
  const [query, setQuery] = useState('');

  const normalizedQuery =
    query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    // ─────────────────────────────────────
    // SÉLECTIONS NATIONALES
    // ─────────────────────────────────────
    const allTeams = [
      ...(nationalTeams?.men || []),
      ...(nationalTeams?.women || []),
      ...(nationalTeams?.youth || []),
    ];

    const teamResults = allTeams
      .filter((team) => {
        const searchableText = [
          team.name,
          team.apiName,
          team.category,
          team.gender,
          team.country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(
          normalizedQuery
        );
      })
      .map((team, index) => ({
        id: `team-${team.id ?? index}`,
        type: 'team',
        title:
          team.name ||
          team.apiName ||
          'Sélection nationale',
        subtitle: 'Sélection nationale',
        icon: UsersRound,
        sectionId: 'national-teams',
      }));

    // ─────────────────────────────────────
    // CLUBS MEMBRES
    // ─────────────────────────────────────
    const clubResults = clubs
      .filter((club) => {
        const searchableText = [
          club.name,
          club.code,
          club.city,
          club.stadium,
          club.league,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(
          normalizedQuery
        );
      })
      .map((club, index) => ({
        id: `club-${club.slug ?? index}`,
        type: 'club',
        title: club.name || 'Club',
        subtitle:
          club.league ||
          club.city ||
          'Club membre',
        icon: Volleyball,
        sectionId: 'clubs',
      }));

    // ─────────────────────────────────────
    // PRODUITS
    // ─────────────────────────────────────
    const productResults = products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.category_slug,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(
          normalizedQuery
        );
      })
      .map((product, index) => ({
        id: `product-${product.id ?? index}`,
        type: 'product',
        title:
          product.name ||
          'Produit',
        subtitle: 'Boutique',
        icon: ShoppingBag,
        sectionId: 'merchandise',
      }));

    return [
      ...teamResults,
      ...clubResults,
      ...productResults,
    ];
  }, [
    normalizedQuery,
    nationalTeams,
    clubs,
    products,
  ]);

  function handleResultClick(result) {
    onClose?.();

    requestAnimationFrame(() => {
      document
        .getElementById(result.sectionId)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        {/* Barre de recherche */}
        <div className="flex items-center gap-3 border-b border-white/10 p-4">
          <Search
            size={19}
            style={{ color: primaryColor }}
          />

          <input
            autoFocus
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Rechercher dans cette fédération..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-bone-500"
          />

          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-bone-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!normalizedQuery ? (
            <p className="px-4 py-8 text-center text-sm text-bone-500">
              Recherchez une sélection, un club ou un produit.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-bone-500">
              Aucun résultat trouvé.
            </p>
          ) : (
            results.map((result) => {
              const Icon = result.icon;

              return (
                <button
                  key={result.id}
                  type="button"
                  onClick={() =>
                    handleResultClick(result)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/5"
                >
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{
                      background:
                        `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-bone-100">
                      {result.title}
                    </span>

                    <span className="block truncate text-xs text-bone-500">
                      {result.subtitle}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}