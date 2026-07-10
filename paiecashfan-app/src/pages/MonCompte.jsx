import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wallet, Ticket, ShoppingBag, ExternalLink, Check, Pencil,
  Receipt, ShieldCheck, Loader2, ArrowRight, History, QrCode,
  Download, X
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
const fmtDateTime = (s) => {
  try { return new Date(s).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
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
  const [history, setHistory] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPcc, setLoadingPcc] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [tab, setTab] = useState('orders');       // 'orders' | 'history'
  const [ticket, setTicket] = useState(null);      // commande billetterie affichée

  useEffect(() => {
    apiFetch('/api/v2/me/orders')
      .then((j) => setOrders(j.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
    apiFetch('/api/v2/me/pcc')
      .then((j) => setPcc(j.data))
      .catch(() => setPcc(null))
      .finally(() => setLoadingPcc(false));
    apiFetch('/api/v2/me/pcc-history')
      .then((j) => setHistory(j.data?.transactions || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
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
          {/* ── Colonne principale : onglets ────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-2">
              <TabBtn active={tab === 'orders'} onClick={() => setTab('orders')} icon={<Receipt size={15} />}>
                Billets & commandes
              </TabBtn>
              <TabBtn active={tab === 'history'} onClick={() => setTab('history')} icon={<History size={15} />}>
                Historique PCC
              </TabBtn>
            </div>

            {tab === 'orders' ? (
              loadingOrders ? (
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
                  {orders.map((o) => (
                    <OrderCard key={o.id} order={o} onViewTicket={() => setTicket(o)} />
                  ))}
                </div>
              )
            ) : (
              <PccHistory loading={loadingHistory} transactions={history} />
            )}
          </div>

          {/* ── Colonne latérale : wallet + profil ──────── */}
          <div className="space-y-6">
            <WalletCard loading={loadingPcc} pcc={pcc} />
            <ProfileCard profile={profile} email={user?.email} updateProfile={updateProfile} />
          </div>
        </div>
      </Container>

      {ticket && (
        <TicketModal order={ticket} buyer={profile?.display_name || user?.email} onClose={() => setTicket(null)} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs font-black uppercase tracking-wider transition-colors border',
        active
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
          : 'bg-white/5 text-bone-400 border-white/10 hover:text-bone-100',
      ].join(' ')}
    >
      {icon}{children}
    </button>
  );
}

function OrderCard({ order, onViewTicket }) {
  const Icon = order.kind === 'ticketing' ? Ticket : ShoppingBag;
  const st = STATUS_LABEL[order.status] || { label: order.status, cls: 'text-bone-400 bg-white/5 border-white/10' };
  const isTicket = order.kind === 'ticketing' && order.status === 'completed';

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

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
          {order.reference
            ? <p className="text-[10px] uppercase tracking-widest text-bone-600 truncate">Réf. {order.reference}</p>
            : <span />}
          {isTicket && (
            <button
              onClick={onViewTicket}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/20 transition shrink-0"
            >
              <QrCode size={12} /> Voir le billet
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ── Billet numérique (QR) + impression PDF ─────────────────────
function TicketModal({ order, buyer, onClose }) {
  const qrValue = `PCF-TKT:${order.id}:${order.reference || ''}`;
  const itemsLabel = (order.items || []).map((i) => `${i.quantity > 1 ? `${i.quantity}× ` : ''}${i.name}`).join(' · ');

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket-printable, #ticket-printable * { visibility: visible !important; }
          #ticket-printable { position: fixed; inset: 0; margin: auto; box-shadow: none !important; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Billet — thème clair pour un rendu "vrai billet" + impression */}
        <div id="ticket-printable" className="relative rounded-3xl bg-white text-ink-900 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 px-6 py-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-90">Billet numérique · PaieCashFan</p>
            <h3 className="mt-1 font-display text-2xl font-black uppercase leading-tight">{order.clubName}</h3>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm font-bold text-ink-900">{itemsLabel}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="uppercase tracking-widest text-ink-400 text-[10px]">Titulaire</p>
                <p className="mt-0.5 font-semibold text-ink-800 truncate">{buyer}</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-ink-400 text-[10px]">Date d'achat</p>
                <p className="mt-0.5 font-semibold text-ink-800">{fmtDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-ink-400 text-[10px]">Montant</p>
                <p className="mt-0.5 font-semibold text-ink-800">{fmt(order.totalPcc)} PCC</p>
              </div>
              <div>
                <p className="uppercase tracking-widest text-ink-400 text-[10px]">Référence</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-700 break-all">{order.reference || order.id.slice(0, 8)}</p>
              </div>
            </div>

            {/* Ligne de perforation */}
            <div className="my-5 flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-black/80 -ml-8" />
              <div className="flex-1 border-t-2 border-dashed border-ink-200" />
              <div className="h-4 w-4 rounded-full bg-black/80 -mr-8" />
            </div>

            <div className="flex flex-col items-center">
              <div className="rounded-2xl border border-ink-100 p-3 bg-white">
                <QRCodeSVG value={qrValue} size={148} level="M" />
              </div>
              <p className="mt-3 text-center text-[11px] text-ink-500">
                Présente ce QR à l'entrée. Billet authentifié via PaieCashCoin.
              </p>
            </div>
          </div>
        </div>

        {/* Actions (hors impression) */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => window.print()}>
            <Download size={15} /> Télécharger / Imprimer
          </Button>
          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-bone-300 hover:text-bone-50"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Historique PCC (paiements côté PaieCashCoin) ───────────────
function PccHistory({ loading, transactions }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
      </div>
    );
  }
  if (!transactions?.length) {
    return (
      <GlassCard className="p-10 text-center">
        <History className="mx-auto text-bone-600" size={38} />
        <p className="mt-4 text-sm text-bone-400">Aucune transaction PCC pour le moment.</p>
      </GlassCard>
    );
  }
  return (
    <GlassCard className="divide-y divide-white/5 overflow-hidden">
      {transactions.map((t) => {
        const st = STATUS_LABEL[t.status] || { label: t.status, cls: 'text-bone-400 bg-white/5 border-white/10' };
        return (
          <div key={t.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-bone-100 truncate">{t.description || 'Paiement PCC'}</p>
              <p className="mt-0.5 text-[11px] text-bone-500">{fmtDateTime(t.createdAt)} · {t.mode}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-base font-black text-emerald-400 tabular-nums">−{fmt(t.pccUsed || t.amountEur)} PCC</p>
              <span className={`mt-1 inline-flex items-center h-5 px-2 rounded-full text-[9px] font-black uppercase tracking-wider border ${st.cls}`}>
                {st.label}
              </span>
            </div>
          </div>
        );
      })}
    </GlassCard>
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
          <p className="text-xs text-bone-500">Disponible pour tes achats — hors épargne bloquée.</p>
          {pcc.balance === 0 && (
            <p className="mt-2 text-xs text-amber-400">Recharge ton compte courant pour payer en PCC.</p>
          )}
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
