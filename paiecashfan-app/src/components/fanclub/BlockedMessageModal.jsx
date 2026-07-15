import { motion } from 'framer-motion';
import { ShieldAlert, Clock, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Message refusé AVANT publication (lot 6).
// Ton : ferme sur la règle, jamais humiliant — un faux positif est possible,
// et le supporter en face est présumé de bonne foi.
const CATEGORY_LABEL = {
  racism: 'Racisme', hate: 'Haine', threat: 'Menace', violence: 'Violence',
  insult: 'Insulte', harassment: 'Harcèlement', sexual_content: 'Contenu sexuel',
  personal_data: 'Données personnelles', spam: 'Spam', provocation: 'Provocation',
};

export function BlockedMessageModal({ moderation, draft, onRewrite, onClose }) {
  if (!moderation) return null;
  const isRate = moderation.action === 'rate_limited';
  const isRewrite = moderation.action === 'request_rewrite';

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${isRate ? 'border-gold-400/30 bg-gold-400/10 text-gold-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
              {isRate ? <Clock size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-[0.28em] font-black ${isRate ? 'text-gold-400' : 'text-red-400'}`}>
                {isRate ? 'Trop rapide' : isRewrite ? 'À reformuler' : 'Message bloqué'}
              </p>
              <h3 className="mt-1 font-display text-lg font-black uppercase text-bone-50 leading-tight">
                {isRate ? 'Ralentis un peu' : "Ton message n'a pas été publié"}
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>

        <p className="mt-4 text-sm text-bone-200">{moderation.reason}</p>

        {moderation.categories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {moderation.categories.map((c) => (
              <span key={c} className="rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-300">
                {CATEGORY_LABEL[c] || c}
              </span>
            ))}
          </div>
        )}

        {moderation.suspended && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-xs font-bold text-red-300">Lecture seule temporaire</p>
            <p className="mt-1 text-[11px] text-bone-300">
              Plusieurs de tes messages ont été bloqués. Tu es en lecture seule pendant 1 heure,
              le temps qu'un modérateur relise. Ce n'est pas une exclusion.
            </p>
          </div>
        )}

        {!isRate && (
          <p className="mt-4 text-[11px] text-bone-500">
            Chambrer et râler sur l'arbitre restent permis — seuls les propos qui blessent une
            personne sont bloqués. {moderation.canAppeal && 'Si tu penses que c\'est une erreur, un modérateur peut réexaminer la décision.'}
          </p>
        )}

        <div className="mt-5 flex gap-2">
          {draft && !isRate && (
            <Button variant="primary" size="md" className="flex-1" onClick={onRewrite}>
              <RefreshCw size={14} /> Reformuler
            </Button>
          )}
          <Button variant="ghost" size="md" className={draft && !isRate ? '' : 'flex-1'} onClick={onClose}>
            J'ai compris
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
