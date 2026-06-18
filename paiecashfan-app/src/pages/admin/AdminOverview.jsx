import { useEffect, useState } from 'react';
import { Users, Shield, ShoppingBag, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          icon={<Users size={18} />}
          label="Utilisateurs"
          value={data?.totalUsers}
          color="emerald"
        />
        <StatCard
          loading={loading}
          icon={<Shield size={18} />}
          label="Clubs actifs"
          value={data?.activeClubs ?? data?.totalClubs}
          color="cyan"
        />
        <StatCard
          loading={loading}
          icon={<ShoppingBag size={18} />}
          label="Transactions"
          value={data?.totalTransactions}
          color="violet"
        />
        <StatCard
          loading={loading}
          icon={<TrendingUp size={18} />}
          label="Volume PCC"
          value={data?.totalVolumePCC != null ? `${Number(data.totalVolumePCC).toLocaleString('fr-FR')} PCC` : undefined}
          color="gold"
        />
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AlertCard
          loading={loading}
          icon={<Clock size={16} />}
          label="Candidatures clubs en attente"
          value={data?.pendingClubApplications}
          to="/admin/clubs"
          color="amber"
        />
        <AlertCard
          loading={loading}
          icon={<Clock size={16} />}
          label="Retraits en attente"
          value={data?.pendingWithdrawals}
          to="/admin/withdrawals"
          color="amber"
        />
        <AlertCard
          loading={loading}
          icon={<AlertTriangle size={16} />}
          label="Signalements fraude ouverts"
          value={data?.openFraudFlags}
          to="/admin/fraud"
          color="red"
        />
      </div>

      {/* Treasury */}
      {!loading && data?.treasury && (
        <div className="rounded-2xl border border-white/10 bg-ink-800/50 p-6">
          <h2 className="font-display font-bold text-bone-100 mb-4 text-sm uppercase tracking-widest">
            Treasury
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {Object.entries(data.treasury).filter(([k]) => !['logs', 'error'].includes(k)).map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] uppercase tracking-widest text-bone-500 mb-1">{k.replace(/_/g, ' ')}</p>
                <p className="font-bold text-bone-100">{typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v ?? '—')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ loading, icon, label, value, color }) {
  const colors = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    cyan:    'text-cyan-400    bg-cyan-500/10    border-cyan-500/20',
    violet:  'text-violet-400  bg-violet-500/10  border-violet-500/20',
    gold:    'text-amber-400   bg-amber-500/10   border-amber-500/20',
  };
  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/50 p-5">
      <div className={`inline-flex h-9 w-9 rounded-xl border items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-bone-500 mb-1">{label}</p>
      {loading
        ? <Skeleton className="h-7 w-16" />
        : <p className="font-display text-xl font-black text-bone-50">{value ?? '—'}</p>
      }
    </div>
  );
}

function AlertCard({ loading, icon, label, value, color }) {
  const colors = {
    amber: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    red:   'border-red-500/20   bg-red-500/5   text-red-400',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      {loading
        ? <Skeleton className="h-6 w-10" />
        : <p className="font-display text-2xl font-black">{value ?? 0}</p>
      }
    </div>
  );
}
