import { useEffect, useRef, useState } from 'react';
import { Heart, Maximize2, ShoppingBag, Star, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { Container } from '@/components/ui/Container';
import { StreamPlayer } from '@/components/fanclub/StreamPlayer';
import { useShopLiveChat } from '@/hooks/useShopLiveChat';
import { ShopLiveChat } from './ShopLiveChat';
import { LiveHearts } from './LiveHearts';

// Bouton « like » (cœur) façon Whatnot, posé en bas à droite de la vidéo.
function LikeButton({ chat, className = '' }) {
  const bump = () => {
    if (!chat.isLoggedIn) return;
    chat.sendLike();
  };
  return (
    <button
      type="button"
      onClick={bump}
      disabled={!chat.isLoggedIn}
      title={chat.isLoggedIn ? 'J\'aime' : 'Connecte-toi pour aimer'}
      className={`group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-black/70 disabled:opacity-60 ${className}`}
    >
      <Heart size={15} className="text-red-400 transition group-active:scale-125 group-hover:fill-red-400" />
      <span className="tabular-nums">{chat.likeCount.toLocaleString('fr-FR')}</span>
    </button>
  );
}

const pccOf = (p) => Number(p?.pcc_price ?? p?.price_pcc ?? 0);
const eurOf = (p) => Number(p?.eur_price ?? 0);
const imgOf = (p) => p?.image_url ?? (Array.isArray(p?.images) ? p.images[0] : null);

// Section « Live Boutique » de la page club : quand le club diffuse un live
// shopping, on embarque la page de visionnage BytePlus + nos fiches produits
// (produit en avant mis en valeur) avec « Acheter » → panier PCC. Masquée hors direct.
export function ClubShopLive({ slug }) {
  const [data, setData] = useState(null);
  const [fs, setFs] = useState(false); // plein écran in-app (overlay)
  const timer = useRef(null);
  const { addItem } = useCart();

  // Plein écran : fermeture au clavier (Échap) + blocage du scroll de fond.
  useEffect(() => {
    if (!fs) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setFs(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [fs]);

  useEffect(() => {
    if (!slug) return undefined;
    let alive = true;
    const load = async () => {
      try {
        const j = await apiFetch(`/api/v2/shop-live/club/${encodeURIComponent(slug)}/current`);
        if (alive) setData(j?.data?.available ? j.data : null);
      } catch { if (alive) setData(null); }
      if (alive) timer.current = window.setTimeout(load, 45_000);
    };
    load();
    return () => { alive = false; if (timer.current) window.clearTimeout(timer.current); };
  }, [slug]);

  const room = data?.room || null;
  // Chat + likes (façon Whatnot) : polling scopé à la salle, actif seulement en direct.
  const chat = useShopLiveChat(room?.id || null, { enabled: room?.status === 'live' });

  // On n'affiche la section QUE si un live est réellement en cours (flux HLS présent).
  if (!room || room.status !== 'live' || !room.streamUrl) return null;

  const products = Array.isArray(data.products) ? data.products : [];
  const featuredId = room.featuredProductId || null;

  const buy = (p) => {
    if (!p) return;
    addItem({
      productId: p.id,
      name: p.name,
      image: imgOf(p),
      qty: 1,
      unitPrice: pccOf(p),
      unitPriceEur: eurOf(p),
    });
  };

  const isFeatured = (it) => (it.product && it.product.id === featuredId) || it.is_featured;
  const ordered = [...products].sort((a, b) => (isFeatured(a) ? 0 : 1) - (isFeatured(b) ? 0 : 1));

  return (
    <section id="live-boutique" className="scroll-mt-20 border-t border-white/5 py-16 md:py-20">
      <Container>
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> En direct
          </span>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-bone-50 md:text-4xl">Live Boutique</h2>
        </div>
        {room.title && <p className="mb-6 text-sm text-bone-400">{room.title}</p>}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Vidéo — lecteur HLS natif (MediaLive) + cœurs flottants (façon Whatnot) */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
              <StreamPlayer isLive provider="hls" url={room.streamUrl} />
              <LiveHearts likeCount={chat.likeCount} />
              <LikeButton chat={chat} className="absolute bottom-3 right-3 z-30" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setFs(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"
              >
                <Maximize2 size={13} /> Plein écran
              </button>
            </div>
          </div>

          {/* Produits présentés */}
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-bone-500">
              Produits présentés ({products.length})
            </p>

            {ordered.length === 0 && (
              <p className="text-sm text-bone-500">Aucun produit associé à ce live pour le moment.</p>
            )}

            <div className="space-y-2.5 lg:max-h-[240px] lg:overflow-y-auto lg:pr-1">
              {ordered.map((it) => {
                const p = it.product;
                if (!p) return null;
                const featured = isFeatured(it);
                return (
                  <div
                    key={it.id || p.id}
                    className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                      featured ? 'border-emerald-400/50 bg-emerald-500/[0.06]' : 'border-white/10 bg-ink-900/50'
                    }`}
                  >
                    {imgOf(p) ? (
                      <img src={imgOf(p)} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/5 text-xl">{p.emoji || '🛍️'}</div>
                    )}

                    <div className="min-w-0 flex-1">
                      {featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          <Star size={11} /> En avant
                        </span>
                      )}
                      <p className="truncate text-sm font-bold text-bone-100">{p.name}</p>
                      <p className="text-xs text-bone-400">{pccOf(p).toLocaleString('fr-FR')} PCC</p>
                    </div>

                    <button
                      onClick={() => buy(p)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-400 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-ink-900 transition hover:bg-emerald-300"
                    >
                      <ShoppingBag size={13} /> Acheter
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Chat en direct (façon Whatnot) : questions au vendeur + réactions */}
            <ShopLiveChat chat={chat} className="h-[440px]" />
          </div>
        </div>
      </Container>

      {/* Plein écran in-app : vidéo + chat en direct (rail droit) + bouton Fermer. */}
      {fs && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" /> En direct
              </span>
              <p className="truncate text-sm font-bold text-bone-100">{room.title || 'Live Boutique'}</p>
            </div>
            <button
              type="button"
              onClick={() => setFs(false)}
              aria-label="Fermer le plein écran"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-bold text-bone-100 transition hover:bg-white/10"
            >
              <X size={16} /> Fermer
            </button>
          </div>
          <div className="grid min-h-0 flex-1 gap-2 px-2 pb-2 sm:px-4 sm:pb-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="relative h-full overflow-hidden rounded-xl border border-white/10 bg-black">
              <StreamPlayer isLive provider="hls" url={room.streamUrl} />
              <LiveHearts likeCount={chat.likeCount} seed={7} />
              <LikeButton chat={chat} className="absolute bottom-3 right-3 z-30" />
            </div>
            {/* Chat en direct — rail de droite (masqué en dessous de lg) */}
            <div className="hidden min-h-0 lg:block">
              <ShopLiveChat chat={chat} className="h-full" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
