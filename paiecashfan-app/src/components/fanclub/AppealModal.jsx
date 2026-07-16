import { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

// Le fan conteste une décision (contenu modéré ou sanction). Ton apaisé :
// on présume la bonne foi, une décision automatique peut se tromper.
export function AppealModal({ target, onClose, onDone }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true); setError('');
    try {
      await apiFetch('/api/v2/me/moderation/appeals', {
        method: 'POST',
        body: JSON.stringify({ targetType: target.type, targetId: target.id, reason }),
      });
      onDone?.();
    } catch (e) { setError(e?.message || 'Contestation impossible.'); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-400/30 bg-sky-400/10 text-sky-300"><Scale size={20} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] font-black text-sky-300">Contestation</p>
              <h3 className="mt-1 font-display text-lg font-black uppercase text-bone-50 leading-tight">Contester cette décision</h3>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>

        <p className="mt-4 text-sm text-bone-300">
          Explique pourquoi tu estimes que cette décision est une erreur. Un modérateur la réexaminera.
        </p>

        <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000}
          placeholder="Ton explication (facultatif mais recommandé)…"
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-bone-100 outline-none focus:border-sky-400/60" />

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

        <div className="mt-5 flex gap-2">
          <Button variant="primary" size="md" className="flex-1" onClick={submit} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Scale size={15} />} Envoyer ma contestation
          </Button>
          <Button variant="ghost" size="md" onClick={onClose}>Annuler</Button>
        </div>
      </motion.div>
    </div>
  );
}
