// BO Super Admin — Gestion des produits (Phase 2.B stub — à enrichir en P2.C)
import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`
        id, name, eur_price, pcc_price, status, category_slug, display_order,
        tenant:tenants(name, slug)
      `)
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) =>
    !search || (p.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">Produits</h1>
          <p className="text-sm text-bone-400 mt-1">{products.length} produits en base</p>
        </div>
        <button onClick={load} className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
        <input
          type="text"
          placeholder="Nom du produit…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-800/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
        />
      </div>

      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">Aucun produit trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3 font-semibold">Produit</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Club</th>
                <th className="text-left px-5 py-3 font-semibold">Prix EUR</th>
                <th className="text-left px-5 py-3 font-semibold">Prix PCC</th>
                <th className="text-left px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-bone-100">{p.name}</p>
                    <p className="text-[10px] text-bone-500">{p.category_slug || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-bone-400 hidden md:table-cell">
                    {p.tenant?.name || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-bone-200">
                    {p.eur_price != null ? `${p.eur_price} €` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono text-emerald-400">
                    {p.pcc_price != null ? `${p.pcc_price} PCC` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex px-2 py-0.5 rounded-md border text-[10px] font-bold',
                      p.status === 'active'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-bone-400 bg-white/5 border-white/10'
                    )}>
                      {p.status || 'draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
