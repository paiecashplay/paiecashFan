import { motion } from 'framer-motion';
import { Wallet, ExternalLink, Info, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const PCC_APP_URL = import.meta.env.VITE_PAIECASHCOIN_URL || 'https://www.paiecashcoin.com';

// Popup explicative avant la redirection vers PaieCashCoin pour recharger le
// solde PCC. Objectif : que le fan ne soit pas perdu — on lui dit OÙ il va, avec
// QUEL email se connecter, et on lui offre un bouton clair. La redirection ouvre
// un nouvel onglet (il garde son panier / sa page).
//
// `found` = l'email existe déjà dans la BDD PaieCashCoin (source: /me/pcc) :
//   · found === true  → connexion (retrouve son wallet)
//   · found === false → inscription (crée son compte, email prérempli)
//   · undefined       → on ne sait pas → on envoie vers la connexion (cas neutre)
export function PccRechargeModal({ email, found, reason, onClose }) {
  const needsRegister = found === false;

  // Deep-links exacts fournis par PaieCashCoin.
  const target = needsRegister
    ? `${PCC_APP_URL}/register?email=${encodeURIComponent(email || '')}&ref=paiecashfan`
    : `${PCC_APP_URL}/login?email=${encodeURIComponent(email || '')}&redirect=${encodeURIComponent('/dashboard?tab=wallet')}`;

  const ctaLabel = needsRegister ? 'Créer mon compte PaieCashCoin' : 'Continuer vers PaieCashCoin';

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"><Wallet size={20} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-black text-emerald-400">{needsRegister ? 'Compte PaieCashCoin' : 'Rechargement PCC'}</p>
              <h3 className="mt-1 font-display text-lg font-black uppercase text-bone-50 leading-tight">{needsRegister ? 'Crée ton compte PaieCashCoin' : 'Recharge ton compte PaieCashCoin'}</h3>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>

        {reason && (
          <p className="mt-4 inline-flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-200">
            <Info size={14} className="mt-0.5 shrink-0" /> {reason}
          </p>
        )}

        <div className="mt-4 space-y-3 text-sm text-bone-300">
          <p>
            {needsRegister
              ? <>Ton email n'a pas encore de compte <b className="text-bone-100">PaieCashCoin</b>, notre partenaire de paiement. Crée-le en une minute pour alimenter et payer en PCC.</>
              : <>Le rechargement se fait en toute sécurité sur <b className="text-bone-100">PaieCashCoin</b>, notre partenaire de paiement. Tu vas être redirigé vers ton espace pour ajouter des PCC.</>}
          </p>
          {email && (
            <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs">
              👉 {needsRegister
                ? <>Ton inscription est préremplie avec <b className="text-emerald-300">{email}</b> — garde le même email que sur PaieCashFan pour que ton solde apparaisse ici.</>
                : <>Connecte-toi avec <b className="text-emerald-300">{email}</b> — le même email que sur PaieCashFan — pour retrouver ton solde ici automatiquement.</>}
            </p>
          )}
          <p className="inline-flex items-start gap-2 text-[11px] text-bone-500">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-400" />
            Une fois {needsRegister ? 'ton compte créé et rechargé' : 'rechargé'}, reviens sur cet onglet : ton nouveau solde s'affichera pour payer en PCC.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <a href={target} target="_blank" rel="noopener noreferrer" onClick={onClose}>
            <Button variant="primary" size="md" className="w-full">
              <ExternalLink size={15} /> {ctaLabel}
            </Button>
          </a>
          <button onClick={onClose} className="text-[11px] text-bone-500 hover:text-bone-300">Plus tard</button>
        </div>
      </motion.div>
    </div>
  );
}
