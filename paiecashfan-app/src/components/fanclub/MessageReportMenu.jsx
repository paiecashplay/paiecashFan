import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Flag, EyeOff, Ban, Copy, Check } from 'lucide-react';

// Actions d'un message : [Signaler] + menu « … ».
//
// Deux règles :
//  1. On ne se modère pas soi-même — sur SON message : uniquement « Copier ».
//  2. Le signalement doit être atteignable AU DOIGT. Pas de `opacity-0` seul :
//     sans survol sur mobile, le bouton serait invisible et la modération
//     inaccessible. Visible par défaut, révélé au survol sur desktop (lg:).
//
// Masquer/bloquer sont LOCAUX (préférence perso, pas une décision de modération).
export function MessageReportMenu({ message, isOwn = false, canReport, onReport, onHideUser, onBlockUser }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function copy() {
    try { await navigator.clipboard.writeText(message.content || ''); setCopied(true); setTimeout(() => setCopied(false), 1500); }
    catch { /* ignore */ }
    setOpen(false);
  }

  const Item = ({ icon: Icon, onClick, danger, children }) => (
    <button
      onClick={() => { setOpen(false); onClick?.(); }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold transition hover:bg-white/5 ${danger ? 'text-red-400' : 'text-bone-200'}`}
    >
      <Icon size={13} /> {children}
    </button>
  );

  // Visible sur tactile, révélé au survol sur desktop.
  const reveal = 'opacity-60 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100';

  return (
    <div className="relative flex items-center gap-0.5" ref={ref}>
      {/* Signalement : action directe, jamais enfouie dans un sous-menu */}
      {canReport && (
        <button
          onClick={() => onReport?.(message)}
          aria-label="Signaler ce message"
          title="Signaler ce message"
          className={`grid h-7 w-7 place-items-center rounded-md text-bone-500 transition hover:bg-red-500/15 hover:text-red-400 ${reveal}`}
        >
          <Flag size={13} />
        </button>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Options du message"
        aria-expanded={open}
        className={`grid h-7 w-7 place-items-center rounded-md text-bone-500 transition hover:bg-white/10 hover:text-bone-200 ${open ? 'opacity-100' : reveal}`}
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <MoreHorizontal size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-30 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl">
          <Item icon={Copy} onClick={copy}>Copier le message</Item>
          {/* On ne se masque ni ne se bloque soi-même */}
          {!isOwn && (
            <>
              <Item icon={EyeOff} onClick={() => onHideUser?.(message.authorId)}>Masquer cet utilisateur pour moi</Item>
              <Item icon={Ban} onClick={() => onBlockUser?.(message.authorId)}>Bloquer cet utilisateur</Item>
              {canReport && <Item icon={Flag} onClick={() => onReport?.(message)} danger>Signaler ce message</Item>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
