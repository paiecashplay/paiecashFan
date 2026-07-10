import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, Ticket, ShoppingBag, ExternalLink, Check, Pencil,
  Receipt, ShieldCheck, Loader2, ArrowRight
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

const PCC_APP_URL = import.meta.env.VITE_PAIECASHCOIN_URL || 'https://www.paiecashcoin.com';

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');
const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); }
  catch { return s; }
};

const STATUS_LABEL = {
  completed: { label: 'Payée', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending:   { label: 'En attente', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  processing:{ label: 'En cours', cls: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  shipped:   { label: 'Expédiée', cls: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  cancelled: { label: 'Annulée', cls: 'text-bone-400 bg-white/5 border-white/10' },
  refunded:  { label: 'Remboursée', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

export function MonCompte() {
  const { user, profile, updateProfile } = useAuth();

  const [orders, setOrders]   = useState(null);
  const [pcc, setPcc]         = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPcc, setLoadingPcc] = useState(true);

  useEffect(() => {
    apiFetch('/api/v2/me/orders')
      .then((j) => setOrders(j.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
    apiFetch('/api/v2/me/pcc')
      .then((j) => setPcc(j.data))
      .catch(() => setPcc(null))
      .finally(() => setLoadingPcc(false));
  }, []);

  const initial = (profile?.display_name || user?.email || 'F')[0].toUpperCase();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.14),transparent_40%)]" />

      <Container className="relative py-12 md:py-16">
        {/* ── En-tête profil ─────────────────────────────── */}
        <div className="flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-2xl font-black text-white shrink-0">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" className="h-full w-full rounded-3xl object-cover" />
              : initial}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-bone-50 truncate">
              {profile?.display_name || 'Mon compte'}
            </h1>
            <p className="mt-1 text-sm text-bone-400 truncate">{user?.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <ShieldCheck size={12} /> Fan
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* ── Colonne principale : commandes ──────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-emerald-400" />
              <h2 className="font-display text-lg font-black uppercase text-bone-100">Mes billets & commandes</h2>
            </div>

            {loadingOrders ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : !orders?.length ? (
              <GlassCard className="p-10 text-center">
                <Ticket className="mx-auto text-bone-600" size={38} />
                <p className="mt-4 text-sm text-bone-400">Tu n'as pas encore de billet ni de commande.</p>
                <Link to="/billetterie">
                  <Button variant="primary" size="md" className="mt-5">
                    <Ticket size={15} /> Voir la billetterie
                  </Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => <OrderCard key={o.id} order={o} />)}
              </div>
            )}
          </div>

          {/* ── Colonne latérale : wallet + profil ──────── */}
          <div className="space-y-6">
            <WalletCard loading={loadingPcc} pcc={pcc} />
            <ProfileCard profile={profile} email={user?.email} updateProfile={updateProfile} />
          </div>
        </div>
      </Container>
    </div>
  );
}

function OrderCard({ order }) {
  const Icon = order.kind === 'ticketing' ? Ticket : ShoppingBag;
  const st = STATUS_LABEL[order.status] || { label: order.status, cls: 'text-bone-400 bg-white/5 border-white/10' };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
              {order.clubLogo
                ? <img src={order.clubLogo} alt="" className="max-h-7 max-w-7 object-contain" />
                : <Icon size={18} className="text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-black text-bone-50 truncate">{order.clubName}</h3>
              <p className="mt-0.5 text-xs text-bone-500">{fmtDate(order.createdAt)}</p>
              <ul className="mt-2 space-y-0.5">
                {(order.items || []).map((it, i) => (
                  <li key={i} className="text-xs text-bone-300 truncate">
                    {it.quantity > 1 ? `${it.quantity}× ` : ''}{it.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${st.cls}`}>
              {order.status === 'completed' && <Check size={11} />}{st.label}
            </span>
            <p className="mt-2 font-display text-lg font-black text-emerald-400 tabular-nums">{fmt(order.totalPcc)} PCC</p>
            {order.totalEur ? <p className="text-[11px] text-bone-500 tabular-nums">{fmt(order.totalEur)} €</p> : null}
          </div>
        </div>
        {order.reference && (
          <p className="mt-3 pt-3 border-t border-white/5 text-[10px] uppercase tracking-widest text-bone-600">
            Réf. {order.reference}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}

function WalletCard({ loading, pcc }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <Wallet size={16} className="text-emerald-400" />
        <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Wallet PCC</h2>
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-9 w-32" />
      ) : pcc?.walletReady ? (
        <>
          <p className="mt-4 font-display text-3xl font-black text-emerald-400 tabular-nums">
            {pcc.balance != null ? `${fmt(pcc.balance)} PCC` : '—'}
          </p>
          <p className="text-xs text-bone-500">Solde disponible sur PaieCashCoin</p>
        </>
      ) : (
        <p className="mt-4 text-sm text-bone-400">
          Ton wallet PaieCashCoin n'est pas encore lié. Crée-le pour payer en PCC (et gagne
          <span className="text-emerald-400 font-bold"> +5 % de bonus</span> à la vérification de ton email).
        </p>
      )}

      <a href={PCC_APP_URL} target="_blank" rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 transition">
        {pcc?.walletReady ? 'Recharger' : 'Créer mon wallet'} <ExternalLink size={13} />
      </a>
    </GlassCard>
  );
}

function ProfileCard({ profile, email, updateProfile }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setSaving(true); setMsg('');
    try {
      await updateProfile({ display_name: name.trim() });
      setMsg('Profil mis à jour.');
      setEditing(false);
    } catch (e) {
      setMsg(e.message || 'Erreur.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Profil</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-bone-500 hover:text-emerald-400 transition" title="Modifier">
            <Pencil size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-bone-500">Nom affiché</p>
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60"
            />
          ) : (
            <p className="mt-0.5 text-sm text-bone-100">{profile?.display_name || '—'}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-bone-500">Email</p>
          <p className="mt-0.5 text-sm text-bone-300">{email}</p>
        </div>
      </div>

      {editing && (
        <div className="mt-4 flex gap-2">
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Enregistrer
          </Button>
          <button onClick={() => { setEditing(false); setName(profile?.display_name || ''); }}
            className="text-xs font-black uppercase tracking-wider text-bone-400 hover:text-bone-100">
            Annuler
          </button>
        </div>
      )}

      {msg && <p className="mt-3 text-xs text-emerald-400">{msg}</p>}

      <Link to="/reset-password" className="mt-4 inline-flex items-center gap-1.5 text-xs text-bone-400 hover:text-emerald-400 transition">
        Changer mon mot de passe <ArrowRight size={12} />
      </Link>
    </GlassCard>
  );
}
