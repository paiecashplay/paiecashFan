import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Flag, EyeOff, Ban, Copy, Check } from 'lucide-react';

// Menu « … » d'un message : signaler, masquer pour moi, bloquer, copier.
// Masquer/bloquer sont LOCAUX (préférence de l'utilisateur, pas une modération).
export function MessageReportMenu({ message, canReport, onReport, onHideUser, onBlockUser }) {
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Options du message"
        className="grid h-6 w-6 place-items-center rounded-md text-bone-500 opacity-0 transition hover:bg-white/10 hover:text-bone-200 group-hover:opacity-100 focus:opacity-100"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <MoreHorizontal size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-30 w-56 overflow-hidden rounded-xl border border-white/10 bg-ink-900/95 backdrop-blur-xl shadow-2xl">
          {canReport && <Item icon={Flag} onClick={() => onReport?.(message)} danger>Signaler ce message</Item>}
          <Item icon={EyeOff} onClick={() => onHideUser?.(message.authorId)}>Masquer cet utilisateur pour moi</Item>
          <Item icon={Ban} onClick={() => onBlockUser?.(message.authorId)}>Bloquer cet utilisateur</Item>
          <Item icon={Copy} onClick={copy}>Copier le message</Item>
        </div>
      )}
    </div>
  );
}
