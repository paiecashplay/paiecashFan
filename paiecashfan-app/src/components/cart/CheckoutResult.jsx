// Écrans de résultat de commande — PARTAGÉS par le modal de checkout (PCC
// immédiat) et la page de retour Stripe (carte/BNPL), pour un design unique
// quel que soit le mode de paiement. Fond stade + confettis (succès).
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ShieldCheck, Wallet, Hash, CalendarDays, Star,
  XCircle, RotateCw, LifeBuoy,
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(Number(n || 0));
export const orderNumberOf = (order) =>
  `#${String(order?.reference || order?.orderId || order?.id || '').slice(-8).toUpperCase() || '———'}`;
const todayStr = () => new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

// Confettis (DOM léger, couleurs PaieCashFan). Éphémère : tombe puis s'efface.
export function Confetti({ count = 70 }) {
  const pieces = useMemo(() => {
    const colors = ['#34d399', '#fcd34d', '#10b981', '#ffffff', '#fbbf24'];
    return Array.from({ length: count }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 1.4,
      dur: 2.6 + Math.random() * 2.2, color: colors[i % colors.length],
      rot: Math.random() * 360, w: 6 + Math.random() * 5,
    }));
  }, [count]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span key={p.id} className="pcf-confetti-piece"
          style={{ left: `${p.left}%`, background: p.color, width: `${p.w}px`, '--pcf-delay': `${p.delay}s`, '--pcf-dur': `${p.dur}s`, rotate: `${p.rot}deg` }} />
      ))}
    </div>
  );
}

function DetailCell({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-ink-900/50 p-4 text-left">
      <div className="flex items-center gap-1.5 text-bone-500"><Icon size={13} /><span className="text-[9px] uppercase tracking-widest font-bold">{label}</span></div>
      <p className={`mt-1.5 font-display text-sm font-black ${accent ? 'text-emerald-400' : 'text-bone-100'}`}>{value}</p>
    </div>
  );
}

function HelpCard({ icon: Icon, title, desc, cta, onClick, tone }) {
  const toneCls = { rose: 'text-rose-400', emerald: 'text-emerald-400', bone: 'text-bone-300' }[tone] || 'text-bone-300';
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
      <Icon size={18} className={toneCls} />
      <p className="mt-2 text-sm font-bold text-bone-100">{title}</p>
      <p className="mt-0.5 text-[11px] text-bone-500">{desc}</p>
      {onClick && <button onClick={onClick} className={`mt-3 inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold ${toneCls} transition hover:bg-white/5`}>{cta}</button>}
    </div>
  );
}

// Écran de confirmation (mockup) : fond stade + confettis + fidélité.
// `actions` = les boutons du bas (diffèrent selon le contexte).
export function OrderSuccessView({ email, amountPcc, order, title = 'Commande confirmée !', subtitle, actions }) {
  const xp = Math.max(1, Math.round(Number(amountPcc || 0) / 10));
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url(/images/stadium-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-[#090b10]/85 to-[#090b10]" />
      <Confetti />
      <div className="relative flex flex-col items-center px-5 py-10 text-center sm:py-14">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }} className="relative">
          <div className="grid h-28 w-28 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] shadow-[0_0_60px_-8px_rgba(52,211,153,0.6)]">
            <img src="/paiecashfan-logo.webp" alt="" className="h-16 w-16 object-contain" />
          </div>
          <span className="absolute -bottom-1 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-emerald-400 text-ink-900 ring-4 ring-[#090b10]"><CheckCircle2 size={20} /></span>
        </motion.div>
        <h3 className="mt-8 font-display text-3xl font-black uppercase text-bone-50">{title}</h3>
        <p className="mt-3 max-w-md text-sm text-bone-300">{subtitle || <>Merci ! Ta commande a bien été enregistrée. Tu recevras le suivi dans « Mes commandes »{email ? ` et par email (${email})` : ''}.</>}</p>

        <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-4">
          <DetailCell icon={Hash} label="Numéro de commande" value={orderNumberOf(order)} />
          <DetailCell icon={CalendarDays} label="Date" value={todayStr()} />
          <DetailCell icon={Wallet} label="Montant payé" value={`${fmt(amountPcc)} PCC`} accent />
          <DetailCell icon={ShieldCheck} label="Paiement" value="Sécurisé" />
        </div>

        <div className="mt-3 grid w-full max-w-2xl gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-left">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-400/15"><img src="/paiecashfan-logo.webp" className="h-6 w-6 object-contain" alt="" /></span>
            <div><p className="font-display text-lg font-black text-emerald-400">+{fmt(amountPcc)} PCC dépensés</p><p className="text-[11px] text-bone-400">Merci pour ta confiance ! Continue de soutenir ta passion ⚽</p></div>
          </div>
          <div className="flex items-center gap-3 text-left sm:border-l sm:border-white/10 sm:pl-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-400/15 text-gold-400"><Star size={20} className="fill-gold-400" /></span>
            <div><p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Récompense fidélité</p><p className="font-display text-lg font-black text-gold-400">+{xp} XP</p><p className="text-[11px] text-bone-400">Tu progresses vers le prochain niveau</p></div>
          </div>
        </div>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">{actions}</div>
      </div>
    </div>
  );
}

// Écran d'échec (mockup) : fond stade rouge + pistes de résolution.
export function OrderFailureView({ amountPcc, message, onRetry, onSupport, actions, title = 'Paiement échoué 🙁', subtitle = "Nous n'avons pas pu traiter votre paiement. Aucun montant n'a été débité." }) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(/images/stadium-bg.png)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 via-[#090b10]/90 to-[#090b10]" />
      <div className="relative flex flex-col items-center px-5 py-10 text-center sm:py-14">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          className="grid h-24 w-24 place-items-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 shadow-[0_0_60px_-8px_rgba(244,63,94,0.55)]">
          <XCircle size={52} />
        </motion.div>
        <h3 className="mt-7 font-display text-3xl font-black uppercase text-bone-50">{title}</h3>
        <p className="mt-3 max-w-md text-sm text-bone-300">{subtitle}</p>
        {message && <p className="mt-2 max-w-md text-xs text-rose-300/80">{message}</p>}

        <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-3">
          <DetailCell icon={CalendarDays} label="Date" value={todayStr()} />
          <DetailCell icon={Wallet} label="Montant" value={`${fmt(amountPcc)} PCC`} />
          <DetailCell icon={XCircle} label="Statut" value="Échec du paiement" />
        </div>

        {onRetry && (
          <div className="mt-6 w-full max-w-2xl">
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-rose-300 font-black">Que pouvez-vous faire ?</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <HelpCard icon={RotateCw} title="Réessayer le paiement" desc="Vérifiez vos informations et réessayez." cta="Réessayer" onClick={onRetry} tone="rose" />
              <HelpCard icon={Wallet} title="Changer de moyen" desc="Une autre carte ou votre solde PCC." cta="Changer de moyen" onClick={onRetry} tone="emerald" />
              <HelpCard icon={LifeBuoy} title="Besoin d'aide ?" desc="Notre support est disponible." cta="Contacter le support" onClick={onSupport} tone="bone" />
            </div>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">{actions}</div>
      </div>
    </div>
  );
}
