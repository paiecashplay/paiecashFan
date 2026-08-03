import {
  Package,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from 'lucide-react';

export default function ShopLiveProducts({
  products = [],
  featuredProductId = null,
  actionLoading = false,
  onFeatureProduct,
  onRemoveProduct,
  onAddProducts,
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-bone-50">
            Produits du live
          </h2>

          <p className="mt-1 text-xs leading-5 text-bone-500">
            Les produits affichés pendant la diffusion.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddProducts}
          disabled={actionLoading}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          Ajouter des produits
        </button>
      </div>

      {products.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-white/10 p-10 text-center">
          <Package
            size={34}
            className="mx-auto text-bone-600"
          />

          <h3 className="mt-4 text-sm font-semibold text-bone-300">
            Aucun produit
          </h3>

          <p className="mt-2 text-xs leading-5 text-bone-500">
            Ajoutez les produits qui seront présentés pendant le
            live.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => {
            const isFeatured =
              product.is_featured ||
              featuredProductId === product.id;

            return (
              <div
                key={product.id}
                className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                  isFeatured
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white/5">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="text-bone-500" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-bone-100">
                      {product.name}
                    </h3>

                    {product.category && (
                      <p className="mt-1 text-xs text-bone-500">
                        {product.category}
                      </p>
                    )}

                    {product.price != null && (
                      <p className="mt-2 text-sm font-semibold text-emerald-400">
                        {product.price} PCC
                      </p>
                    )}

                    {isFeatured && (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold text-emerald-300">
                        Produit mis en avant
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={actionLoading || isFeatured}
                    onClick={() =>
                      onFeatureProduct(product.id)
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-bone-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isFeatured ? (
                      <>
                        <PinOff size={15} />
                        En vedette
                      </>
                    ) : (
                      <>
                        <Pin size={15} />
                        Mettre en avant
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      onRemoveProduct(product.id)
                    }
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                    Retirer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}