import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Motifs alignés sur les catégories de modération du backend.
const REASONS = [
  { id: 'insult', label: 'Insulte' },
  { id: 'harassment', label: 'Harcèlement' },
  { id: 'hate', label: 'Propos haineux' },
  { id: 'racism', label: 'Racisme / discrimination' },
  { id: 'threat', label: 'Menace' },
  { id: 'violence', label: 'Appel à la violence' },
  { id: 'sexual_content', label: 'Contenu sexuel' },
  { id: 'personal_data', label: 'Données personnelles' },
  { id: 'spam', label: 'Spam / publicité' },
  { id: 'provocation', label: 'Provocation répétée' },
  { id: 'other', label: 'Autre' },
];

export function ReportMessageModal({ message, onSubmit, onClose }) {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [state, setState] = useState('idle');   // idle | sending | done
  const [error, setError] = useState('');

  async function submit() {
    if (!reason) { setError('Choisis un motif.'); return; }
    setState('sending'); setError('');
    try { await onSubmit({ reason, comment }); setState('done'); }
    catch (e) { setError(e?.message || 'Signalement impossible.'); setState('idle'); }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl"
      >
        {state === 'done' ? (
          <div className="text-center">
            <Check className="mx-auto text-emerald-400" size={48} />
            <h3 className="mt-4 font-display text-xl font-black uppercase text-bone-50">Signalement envoyé</h3>
            <p className="mt-3 text-sm text-bone-400">
              Merci. Un modérateur va examiner ce message. <b className="text-bone-200">Ton signalement est anonyme</b> :
              l'auteur ne saura pas que tu l'as signalé.
            </p>
            <Button variant="primary" size="md" className="mt-6" onClick={onClose}>Fermer</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400"><Flag size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-red-400 font-black">Signalement</p>
                  <h3 className="mt-1 font-display text-xl font-black uppercase text-bone-50">Signaler ce message</h3>
                </div>
              </div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
            </div>

            {/* Extrait du message signalé */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">{message?.author || 'Supporter'}</p>
              <p className="mt-1 text-sm text-bone-300 line-clamp-3">{message?.content}</p>
            </div>

            <p className="mt-5 text-[10px] uppercase tracking-widest text-bone-500 font-bold">Motif</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {REASONS.map((r) => (
                <button key={r.id} onClick={() => setReason(r.id)}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                    reason === r.id ? 'border-red-500/60 bg-red-500/15 text-red-300' : 'border-white/10 bg-white/[0.03] text-bone-400 hover:text-bone-200'}`}>
                  {r.label}
                </button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-[10px] uppercase tracking-widest text-bone-500 font-bold">Précision (optionnel)</span>
              <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500}
                placeholder="Explique brièvement le problème…"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60" />
            </label>

            {error && <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"><AlertCircle size={14} /> {error}</div>}

            <p className="mt-3 text-[11px] text-bone-500">Ton signalement est <b className="text-bone-300">anonyme</b> et sera examiné par un modérateur.</p>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" size="md" onClick={onClose} disabled={state === 'sending'}>Annuler</Button>
              <Button variant="primary" size="md" onClick={submit} disabled={state === 'sending' || !reason}>
                {state === 'sending' ? <><Loader2 size={15} className="animate-spin" /> Envoi…</> : <><Flag size={15} /> Signaler</>}
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
