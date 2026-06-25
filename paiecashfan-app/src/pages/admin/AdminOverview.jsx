import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Shield, Globe, ShoppingBag, AlertTriangle, Clock,
  TrendingUp, Receipt, ChevronRight
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function AdminOverview() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    apiFetch('/api/v2/admin/overview')
      .then((json) => setData(json.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => (n == null ? null : Number(n).toLocaleString('fr-FR'));

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-black text-bone-50">Vue d'ensemble</h1>
        <p className="text-sm text-bone-400 mt-1">Tableau de bord super admin</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* KPI cards — cliquables pour accéder directement à la section
          (essentiel sur mobile où le menu de gauche est masqué). */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard loading={loading} icon={<Users size={18} />}       label="Utilisateurs" value={fmt(data?.totalUsers)}        color="emerald" to="/admin/users" />
        <StatCard loading={loading} icon={<Shield size={18} />}      label="Clubs actifs" value={fmt(data?.activeClubs ?? data?.totalClubs)} color="cyan" to="/admin/clubs" />
        <StatCard loading={loading} icon={<Globe size={18} />}       label="Fédérations"  value={fmt(data?.totalFederations)}   color="sky" to="/admin/federations" />
        <StatCard loading={loading} icon={<ShoppingBag size={18} />} label="Produits"     value={fmt(data?.totalProducts)}      color="violet" to="/admin/products" />
        <StatCard loading={loading} icon={<Receipt size={18} />}     label="Transactions" value={fmt(data?.totalTransactions)}   color="rose" />
        <StatCard loading={loading} icon={<TrendingUp size={18} />}  label="Volume PCC"   value={data?.totalVolumePCC != null ? `${fmt(data.totalVolumePCC)} PCC` : null} color="gold" />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AlertCard loading={loading} icon={<Clock size={16} />}         label="Candidatures clubs en attente" value={data?.pendingClubApplications} to="/admin/clubs" color="amber" />
        <AlertCard loading={loading} icon={<Clock size={16} />}         label="Retraits en attente"            value={data?.pendingWithdrawals}        to="/admin/withdrawals" color="amber" />
        <AlertCard loading={loading} icon={<AlertTriangle size={16} />} label="Signalements fraude ouverts"    value={data?.openFraudFlags}            to="/admin/fraud" color="red" />
      </div>

      {/* Treasury */}
      {!loading && data?.treasury && (
        <div className="rounded-2xl border border-white/10 bg-ink-800/50 p-6">
          <h2 className="font-display font-bold text-bone-100 mb-4 text-sm uppercase tracking-widest">
            Treasury
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(data.treasury).filter(([k]) => !['logs', 'error'].includes(k)).map(([k, v]) => (
              <div key={k} className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-bone-500 mb-1">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}</p>
                <p className="font-bold text-bone-100 break-words font-mono text-xs">{formatTreasuryValue(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Formate une valeur de treasury : nombre localisé, objet aplati en
// « clé: valeur · … » (évite le « [object Object] »), sinon string.
function formatTreasuryValue(v) {
  if (v == null) return '—';
  if (typeof v === 'number') return v.toLocaleString('fr-FR');
  if (typeof v === 'object') {
    const entries = Object.entries(v);
    if (!entries.length) return '—';
    return entries
      .map(([k, val]) => `${k}: ${typeof val === 'number' ? val.toLocaleString('fr-FR') : String(val)}`)
      .join(' · ');
  }
  return String(v);
}

const STAT_COLORS = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  cyan:    'text-cyan-400    bg-cyan-500/10    border-cyan-500/20',
  sky:     'text-sky-400     bg-sky-500/10     border-sky-500/20',
  violet:  'text-violet-400  bg-violet-500/10  border-violet-500/20',
  rose:    'text-rose-400    bg-rose-500/10    border-rose-500/20',
  gold:    'text-amber-400   bg-amber-500/10   border-amber-500/20',
};

function StatCard({ loading, icon, label, value, color, to }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className={`inline-flex h-9 w-9 rounded-xl border items-center justify-center mb-3 ${STAT_COLORS[color]}`}>
          {icon}
        </div>
        {to && <ChevronRight size={16} className="text-bone-600 group-hover:text-emerald-400 transition-colors" />}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-bone-500 mb-1">{label}</p>
      {loading
        ? <Skeleton className="h-7 w-16" />
        : <p className="font-display text-xl font-black text-bone-50">{value ?? '—'}</p>}
    </>
  );

  const base = 'rounded-2xl border bg-ink-800/50 p-5 transition-all duration-200';

  if (to) {
    return (
      <Link to={to} className={`group block cursor-pointer border-white/8 hover:border-emerald-500/30 hover:bg-ink-800/80 ${base}`}>
        {inner}
      </Link>
    );
  }
  return <div className={`border-white/8 ${base}`}>{inner}</div>;
}

function AlertCard({ loading, icon, label, value, color, to }) {
  const colors = {
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10',
    red:   'border-red-500/20   bg-red-500/5   text-red-400   hover:bg-red-500/10',
  };
  return (
    <Link to={to} className={`group block rounded-xl border p-4 cursor-pointer transition-colors ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold flex-1">{label}</span>
        <ChevronRight size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
      {loading
        ? <Skeleton className="h-6 w-10" />
        : <p className="font-display text-2xl font-black">{value ?? 0}</p>}
    </Link>
  );
}
