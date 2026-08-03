import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';

function getProductId(product) {
  return product?.id ?? product?.product_id ?? null;
}

function getProductImage(product) {
  return (
    product?.image ||
    product?.image_url ||
    product?.imageUrl ||
    product?.thumbnail ||
    product?.thumbnail_url ||
    ''
  );
}

function getProductName(product) {
  return (
    product?.name ||
    product?.title ||
    product?.product_name ||
    'Produit sans nom'
  );
}

function getProductCategory(product) {
  return (
    product?.category ||
    product?.category_name ||
    product?.type ||
    ''
  );
}

function getProductPrice(product) {
  const price =
    product?.price ??
    product?.sale_price ??
    product?.salePrice ??
    null;

  if (
    price === null ||
    price === undefined ||
    price === ''
  ) {
    return null;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: product?.currency || 'EUR',
  }).format(numericPrice);
}

export default function AddShopLiveProductsModal({
  open,
  onClose,
  availableProducts = [],
  selectedProducts = [],
  onSave,
  loading = false,
  error = '',
  clearError,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentSelectedIds = selectedProducts
      .map(getProductId)
      .filter(Boolean)
      .map(String);

    setSelectedIds(currentSelectedIds);
    setSearch('');
    setLocalError('');
    clearError?.();
  }, [
    open,
    selectedProducts,
    clearError,
  ]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return availableProducts;
    }

    return availableProducts.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const category =
        getProductCategory(product).toLowerCase();

      return (
        name.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    });
  }, [availableProducts, search]);

  const selectedCount = selectedIds.length;

  function isSelected(product) {
    const productId = getProductId(product);

    if (!productId) {
      return false;
    }

    return selectedIds.includes(String(productId));
  }

  function toggleProduct(product) {
    if (loading) {
      return;
    }

    const productId = getProductId(product);

    if (!productId) {
      setLocalError(
        'Ce produit ne possède pas d’identifiant valide.'
      );
      return;
    }

    const normalizedId = String(productId);

    setLocalError('');

    setSelectedIds((currentIds) => {
      if (currentIds.includes(normalizedId)) {
        return currentIds.filter(
          (id) => id !== normalizedId
        );
      }

      return [...currentIds, normalizedId];
    });
  }

  function selectAllVisible() {
    if (loading) {
      return;
    }

    const visibleIds = filteredProducts
      .map(getProductId)
      .filter(Boolean)
      .map(String);

    setSelectedIds((currentIds) => [
      ...new Set([...currentIds, ...visibleIds]),
    ]);
  }

  function clearSelection() {
    if (loading) {
      return;
    }

    setSelectedIds([]);
    setLocalError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLocalError('');
    clearError?.();

    const productsToSave = availableProducts.filter(
      (product) => {
        const productId = getProductId(product);

        return (
          productId &&
          selectedIds.includes(String(productId))
        );
      }
    );

    try {
      await onSave(productsToSave);
      onClose();
    } catch (saveError) {
      setLocalError(
        saveError?.message ||
          'Impossible d’enregistrer les produits du live.'
      );
    }
  }

  function handleClose() {
    if (loading) {
      return;
    }

    setLocalError('');
    clearError?.();
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-shop-live-products-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="mx-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-2xl">
        {/* En-tête */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <ShoppingBag
                  size={19}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h2
                  id="add-shop-live-products-title"
                  className="font-display text-lg font-bold text-bone-50"
                >
                  Ajouter des produits
                </h2>

                <p className="mt-1 text-xs text-bone-500">
                  Sélectionnez les produits à présenter pendant
                  le live.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Fermer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-bone-400 transition hover:bg-white/5 hover:text-bone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        {/* Barre de recherche et sélection */}
        <div className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-bone-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un produit..."
                disabled={loading}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-bone-100 outline-none transition placeholder:text-bone-600 focus:border-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-bone-300">
                {selectedCount} sélectionné
                {selectedCount > 1 ? 's' : ''}
              </span>

              <button
                type="button"
                onClick={selectAllVisible}
                disabled={
                  loading || filteredProducts.length === 0
                }
                className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-bone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tout sélectionner
              </button>

              <button
                type="button"
                onClick={clearSelection}
                disabled={
                  loading || selectedIds.length === 0
                }
                className="min-h-10 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-bone-400 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tout désélectionner
              </button>
            </div>
          </div>
        </div>

        {/* Corps défilable */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {(localError || error) && (
              <div
                role="alert"
                className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {localError || error}
              </div>
            )}

            {availableProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                <Package
                  size={34}
                  className="mx-auto text-bone-600"
                />

                <h3 className="mt-4 text-sm font-semibold text-bone-300">
                  Aucun produit disponible
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-bone-500">
                  Ajoutez d’abord des produits dans la boutique
                  du club avant de les associer au live.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center">
                <Search
                  size={32}
                  className="mx-auto text-bone-600"
                />

                <h3 className="mt-4 text-sm font-semibold text-bone-300">
                  Aucun résultat
                </h3>

                <p className="mt-2 text-xs text-bone-500">
                  Aucun produit ne correspond à « {search} ».
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const productId = getProductId(product);
                  const selected = isSelected(product);
                  const image = getProductImage(product);
                  const name = getProductName(product);
                  const category =
                    getProductCategory(product);
                  const price = getProductPrice(product);

                  return (
                    <button
                      key={productId}
                      type="button"
                      onClick={() =>
                        toggleProduct(product)
                      }
                      disabled={loading || !productId}
                      className={`group flex min-h-28 items-start gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package
                            size={25}
                            className="text-bone-600"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-semibold text-bone-100">
                              {name}
                            </h3>

                            {category && (
                              <p className="mt-1 truncate text-xs text-bone-500">
                                {category}
                              </p>
                            )}
                          </div>

                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                              selected
                                ? 'border-emerald-400 bg-emerald-500 text-white'
                                : 'border-white/20 bg-white/5 text-transparent'
                            }`}
                          >
                            <Check size={14} />
                          </span>
                        </div>

                        {price && (
                          <p className="mt-3 text-sm font-bold text-emerald-400">
                            {price}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pied fixe */}
          <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-xs text-bone-500 sm:text-left">
              Les produits déjà associés peuvent être
              désélectionnés avant l’enregistrement.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-bone-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-hero px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Enregistrer la sélection
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}