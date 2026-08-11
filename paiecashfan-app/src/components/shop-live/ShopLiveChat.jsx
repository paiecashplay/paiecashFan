import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Send, SmilePlus, Heart, Trash2 } from 'lucide-react';

const REACTION_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '🔥'];

function initials(name) {
  return String(name || 'S').trim().slice(0, 2).toUpperCase();
}

function timeLabel(iso) {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

// Une bulle de message + ses réactions.
function ChatMessage({ msg, currentUserId, onToggleReaction, onDelete }) {
  const [palette, setPalette] = useState(false);
  const mine = msg.authorId === currentUserId;

  return (
    <div className="group flex gap-2.5">
      {msg.avatar ? (
        <img src={msg.avatar} alt="" className="mt-0.5 h-7 w-7 shrink-0 rounded-full object-cover" />
      ) : (
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-[10px] font-black text-emerald-300">
          {initials(msg.author)}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-bone-200">
          <span className="mr-1.5 font-bold text-bone-50">{msg.author}</span>
          <span className={msg.pending ? 'text-bone-500' : ''}>{msg.content}</span>
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-bone-600">{timeLabel(msg.createdAt)}</span>

          {(msg.reactions || []).map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => onToggleReaction(msg.id, r.emoji)}
              className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition ${
                r.mine ? 'border-emerald-400/50 bg-emerald-500/15 text-bone-100' : 'border-white/10 bg-white/5 text-bone-300 hover:bg-white/10'
              }`}
            >
              <span>{r.emoji}</span>
              <span className="tabular-nums">{r.count}</span>
            </button>
          ))}

          {/* Ajouter une réaction */}
          {currentUserId && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPalette((v) => !v)}
                aria-label="Réagir"
                className="grid h-5 w-5 place-items-center rounded-full text-bone-500 opacity-0 transition hover:bg-white/10 hover:text-bone-200 group-hover:opacity-100"
              >
                <SmilePlus size={13} />
              </button>
              {palette && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPalette(false)} />
                  <div className="absolute bottom-6 left-0 z-20 flex gap-0.5 rounded-full border border-white/10 bg-ink-900 px-1.5 py-1 shadow-xl">
                    {REACTION_EMOJIS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { onToggleReaction(msg.id, e); setPalette(false); }}
                        className="grid h-6 w-6 place-items-center rounded-full text-sm transition hover:scale-125 hover:bg-white/10"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {mine && !msg.pending && (
            <button
              type="button"
              onClick={() => onDelete(msg.id)}
              aria-label="Supprimer"
              className="grid h-5 w-5 place-items-center rounded-full text-bone-600 opacity-0 transition hover:bg-red-500/15 hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Panneau de chat en direct du Live Boutique (façon Whatnot).
// Reçoit l'état du hook `useShopLiveChat` via `chat` (appelé une seule fois
// dans ClubShopLive pour éviter le double polling).
export function ShopLiveChat({ chat, className = '' }) {
  const { messages, likeCount, error, isLoggedIn, currentUserId, sendMessage, toggleReaction, deleteMessage, clearError } = chat;
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const stickyRef = useRef(true); // l'utilisateur est-il collé en bas ?

  // Auto-scroll : suit le direct sauf si l'utilisateur a remonté l'historique.
  useEffect(() => {
    const el = listRef.current;
    if (el && stickyRef.current) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickyRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const submit = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    stickyRef.current = true;
    const okSent = await sendMessage(content);
    if (okSent) setDraft('');
    setSending(false);
  };

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/50 ${className}`}>
      {/* En-tête */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3.5 py-2.5">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-bone-50">Chat en direct</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-300">
          <Heart size={11} className="fill-red-400 text-red-400" />
          <span className="tabular-nums">{likeCount.toLocaleString('fr-FR')}</span>
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} onScroll={onScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3.5 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 py-8 text-center">
            <MessageCircle size={26} className="text-bone-700" />
            <p className="text-sm text-bone-500">Aucun message pour l'instant.</p>
            <p className="text-xs text-bone-600">Pose ta question au vendeur du club !</p>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessage
              key={m.id}
              msg={m}
              currentUserId={currentUserId}
              onToggleReaction={toggleReaction}
              onDelete={deleteMessage}
            />
          ))
        )}
      </div>

      {/* Erreur (ex. modération) */}
      {error && (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-3.5 py-2">
          <p className="text-[11px] leading-4 text-red-300">
            {error}
            <button type="button" onClick={clearError} className="ml-2 underline hover:no-underline">OK</button>
          </p>
        </div>
      )}

      {/* Saisie */}
      <div className="shrink-0 border-t border-white/10 p-2.5">
        {isLoggedIn ? (
          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              placeholder="Écris un message…"
              className="h-10 flex-1 rounded-full border border-white/10 bg-ink-900/70 px-4 text-sm text-bone-100 outline-none transition placeholder:text-bone-600 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              aria-label="Envoyer"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400 text-ink-900 transition hover:bg-emerald-300 disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        ) : (
          <Link
            to="/login"
            className="flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-bone-200 transition hover:bg-white/10"
          >
            Connecte-toi pour participer au chat
          </Link>
        )}
      </div>
    </div>
  );
}
