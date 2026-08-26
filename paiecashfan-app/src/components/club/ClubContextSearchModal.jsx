import { useMemo, useState } from 'react';
import {
  Search,
  X,
  UserRound,
  ShoppingBag,
  Trophy,
} from 'lucide-react';

export function ClubContextSearchModal({
  players = [],
  products = [],
  trophies = [],
  primaryColor = '#10b981',
  onClose,
}) {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) {
        return [];
    }

    // ─────────────────────────────────────────────
    // JOUEURS
    // Structure réelle :
    // { number, name, position, country, image, ... }
    // ─────────────────────────────────────────────
    const playerResults = players
        .filter((player) => {
        const searchableText = [
            player.name,
            player.position,
            player.number,
            player.country,
        ]
            .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                value !== ''
            )
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
        })
        .map((player, index) => ({
        id: `player-${
            player.id ||
            player.apiId ||
            `${player.name || 'unknown'}-${index}`
        }`,

        type: 'player',

        title:
            player.name ||
            'Joueur',

        subtitle:
            [
            player.number
                ? `N° ${player.number}`
                : null,
            player.position,
            ]
            .filter(Boolean)
            .join(' • ') ||
            'Effectif',

        icon: UserRound,
        sectionId: 'squad',
        }));

    // ─────────────────────────────────────────────
    // PRODUITS
    // Structure réelle :
    // { id, name, description, eur_price, ... }
    // ─────────────────────────────────────────────
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

        return searchableText.includes(normalizedQuery);
        })
        .map((product, index) => ({
        id: `product-${
            product.id || index
        }`,

        type: 'product',

        title:
            product.name ||
            'Produit',

        subtitle:
            product.eur_price != null
            ? `Boutique • ${product.eur_price} €`
            : 'Boutique',

        icon: ShoppingBag,
        sectionId: 'merchandise',
        }));

    // ─────────────────────────────────────────────
    // PALMARÈS
    // Structure réelle :
    // { id, label, count, years, scope, ... }
    // ─────────────────────────────────────────────
    const trophyResults = trophies
        .filter((trophy) => {
        const searchableText = [
            trophy.label,
            trophy.years,
            trophy.scope,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
        })
        .map((trophy, index) => ({
        id: `trophy-${
            trophy.id ||
            `${trophy.label || 'unknown'}-${index}`
        }`,

        type: 'trophy',

        title:
            trophy.label ||
            'Trophée',

        subtitle:
            [
            trophy.count
                ? `${trophy.count} titre${
                    Number(trophy.count) > 1
                    ? 's'
                    : ''
                }`
                : null,

            trophy.years,
            ]
            .filter(Boolean)
            .join(' • ') ||
            'Palmarès',

        icon: Trophy,
        sectionId: 'trophies',
        }));

    return [
        ...playerResults,
        ...productResults,
        ...trophyResults,
    ];
    }, [normalizedQuery, players, products, trophies,]);

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
        onMouseDown={(e) => e.stopPropagation()}
      >
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
            placeholder="Rechercher dans ce club..."
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

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!normalizedQuery ? (
            <p className="px-4 py-8 text-center text-sm text-bone-500">
              Recherchez un joueur, un produit ou un trophée.
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
                      background: `${primaryColor}20`,
                      color: primaryColor,
                    }}
                  >
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-bone-100">
                      {result.title}
                    </span>

                    <span className="block text-xs text-bone-500">
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