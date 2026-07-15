import { Ban, Clock } from 'lucide-react';

const LABEL = {
  mute: 'Lecture seule', room_suspension: 'Suspension du salon',
  room_ban: 'Exclusion du salon', global_chat_ban: 'Exclusion de tous les salons',
};
const TEXT = {
  mute: 'Tu peux lire les messages, mais pas publier.',
  room_suspension: 'Tu es temporairement suspendu de ce salon.',
  room_ban: 'Tu es exclu de ce salon.',
  global_chat_ban: 'Tu es exclu de tous les salons de supporters.',
};

// Bandeau affiché en haut du salon quand une sanction bloquante est active.
export function ActiveSanctionBanner({ sanction }) {
  if (!sanction) return null;
  const until = sanction.endsAt && !sanction.isPermanent
    ? new Date(sanction.endsAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  return (
    <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-500/30 bg-red-500/15 text-red-400">
        <Ban size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-red-300">{LABEL[sanction.type] || 'Sanction active'}</p>
        <p className="mt-0.5 text-xs text-bone-300">
          {TEXT[sanction.type] || 'Tu ne peux pas publier pour le moment.'}
          {sanction.reasonText ? ` Motif : ${sanction.reasonText}` : ''}
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-bone-400">
          <Clock size={11} />
          {sanction.isPermanent ? 'Sanction définitive' : until ? `Jusqu'au ${until}` : 'Durée indéterminée'}
        </p>
      </div>
    </div>
  );
}
