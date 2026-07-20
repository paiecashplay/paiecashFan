import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Send,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  Ban,
  ShieldAlert,
  SmilePlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MessageReportMenu } from './MessageReportMenu';

export function LiveChat({
  mode = 'club',
  club,
  messages = [],
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  onSendMessage,
  // Modération (mode club)
  access = null,
  currentUserId = null,
  onReport,
  onHideUser,
  onOpenCharter,
  onToggleReaction
}) {
  const [message, setMessage] = useState('');

  // Références pour le scroll automatique
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const initialScrollDoneRef = useRef(false);
  const lastMessageIdRef = useRef(null);

  const isClubMode = mode === 'club';
  const loggedIn = access ? access.isLoggedIn : !!currentUserId;
  const sanction = access?.activeSanction || null;
  const needsCharter = !!access?.needsCharter;
  // On ne peut écrire que connecté, sans sanction bloquante.
  const canWrite = !isClubMode || (loggedIn && !sanction);

  // Scroll automatique vers le bas si on est proche du bas
  function handleMessagesScroll() {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    isNearBottomRef.current = distanceFromBottom <= 120;
  }

  // Réinitialisation des références de scroll à chaque changement de mode ou de club
  useEffect(() => {
    initialScrollDoneRef.current = false;
    isNearBottomRef.current = true;
    lastMessageIdRef.current = null;
  }, [mode, club?.slug]);

  // Scroll automatique vers le bas si on est proche du bas
  useEffect(() => {
    if (loading || error) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id ?? null;

    // À la première ouverture, toujours afficher le dernier message.
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      lastMessageIdRef.current = lastMessageId;

      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'auto',
          block: 'end'
        });
      });

      return;
    }

  // Le polling a renvoyé exactement le même dernier message :
  // ne pas déplacer le scroll.
  if (lastMessageId === lastMessageIdRef.current) {
    return;
  }

  lastMessageIdRef.current = lastMessageId;

    const isMyMessage =
      Boolean(currentUserId) &&
      lastMessage?.authorId === currentUserId;

    // On descend si :
    // - l'utilisateur était déjà proche du bas ;
    // - ou le nouveau message est le sien.
    if (isNearBottomRef.current || isMyMessage) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      });
    }
  }, [
    messages,
    loading,
    error,
    currentUserId
  ]);

  function handleSend() {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading || error) return;

    const sent = onSendMessage?.(cleanMessage);

    if (sent !== false) {
      setMessage('');
    }
  }

  // Hauteur bornée = le chat scrolle au lieu d'allonger la page.
  // En côte-à-côte (lg+), on reprend `h-full` pour s'aligner sur la hauteur de
  // la vidéo ; sans risque de débordement grâce au `min-h-0` de la zone
  // messages plus bas (c'était ça, le vrai bug d'origine).
  return (
    <section className="flex h-[70vh] min-h-[420px] max-h-[720px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] max-sm:h-[65vh] max-sm:min-h-[360px] lg:h-full lg:max-h-none">
      <div className="shrink-0 border-b border-white/10 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-bone-50">
          <MessageCircle
            size={20}
            style={{ color: club.primaryColor }}
          />

          {isClubMode ? 'Chat Fan Club' : 'Chat privé'}
        </h2>

        <p className="mt-1 text-sm text-bone-400">
          {isClubMode
            ? 'Discute en direct avec tous les supporters.'
            : 'Discute uniquement avec tes amis pendant le live.'}
        </p>
      </div>
      
      {/* Conteneur des messages avec scroll */}
      <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {loading && <ChatSkeleton />}

        {!loading && error && (
          <ChatError
            error={error}
            onRetry={onRetry}
          />
        )}

        {!loading && !error && isEmpty && (
          <ChatEmpty isClubMode={isClubMode} />
        )}

        {!loading &&
          !error &&
          messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="group rounded-2xl bg-ink-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-bone-100">
                  {msg.author}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-[10px] text-bone-500">{msg.createdAt}</span>
                  {isClubMode && (
                    <MessageReportMenu
                      message={msg}
                      isOwn={msg.authorId === currentUserId}
                      canReport={loggedIn && msg.authorId !== currentUserId}
                      onReport={onReport}
                      onHideUser={onHideUser}
                      onBlockUser={onHideUser}
                    />
                  )}
                </div>
              </div>

              <p className="mt-2 break-words text-sm text-bone-300">
                {msg.content}
              </p>

              <MessageReactions
                reactions={msg.reactions}
                canReact={canWrite && loggedIn}
                onToggle={(emoji) => onToggleReaction?.(msg.id, emoji)}
              />
            </motion.div>
          ))
        }

        {/* Élément invisible pour le scroll automatique */}
        <div ref={bottomRef} aria-hidden="true" className="h-px"/>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-ink-950/80 p-4 backdrop-blur">
        {/* Sanction active → lecture seule */}
        {isClubMode && sanction ? (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            <Ban size={14} className="mt-0.5 shrink-0" />
            <span>
              {sanction.type === 'mute' && 'Tu es temporairement en lecture seule.'}
              {sanction.type === 'room_suspension' && 'Tu es suspendu de ce salon.'}
              {sanction.type === 'room_ban' && 'Tu es exclu de ce salon.'}
              {sanction.type === 'global_chat_ban' && 'Tu es exclu de tous les salons.'}
              {sanction.endsAt && !sanction.isPermanent && ` Jusqu'au ${new Date(sanction.endsAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}.`}
            </span>
          </div>
        ) : isClubMode && !loggedIn ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <span className="text-xs text-bone-400">Connecte-toi pour participer au salon.</span>
            <Link to="/login" className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-400">Se connecter</Link>
          </div>
        ) : isClubMode && needsCharter ? (
          <button onClick={onOpenCharter} className="flex w-full items-center justify-between gap-3 rounded-xl border border-gold-400/30 bg-gold-400/10 px-4 py-3 text-left transition hover:bg-gold-400/15">
            <span className="inline-flex items-center gap-2 text-xs text-gold-300"><ShieldAlert size={14} /> Accepte la charte du salon pour publier.</span>
            <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-gold-400">Lire la charte</span>
          </button>
        ) : (
          <div className="flex gap-2 sm:gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              disabled={loading || Boolean(error) || !canWrite}
              placeholder={
                isClubMode
                  ? 'Écris dans le chat du Fan Club...'
                  : 'Écris à tes amis...'
              }
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none placeholder:text-bone-500 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || loading || Boolean(error) || !canWrite}
              aria-label="Envoyer le message"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: club.primaryColor }}
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// Palette fermée, identique au backend (et à la contrainte en base).
const REACTION_EMOJIS = ['👍', '👎', '❤️', '😂', '😮', '🔥'];

// Puces de réaction sous un message + sélecteur d'emoji.
// Les puces posées restent visibles ; le sélecteur n'apparaît qu'au survol
// (ou au focus clavier) pour ne pas surcharger le fil.
function MessageReactions({ reactions = [], canReact, onToggle }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const has = reactions.length > 0;
  if (!has && !canReact) return null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          disabled={!canReact}
          onClick={() => onToggle(r.emoji)}
          aria-pressed={r.mine}
          title={r.mine ? 'Retirer ma réaction' : 'Réagir'}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition ${
            r.mine
              ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200'
              : 'border-white/10 bg-white/[0.04] text-bone-300 hover:border-white/20'
          } ${canReact ? '' : 'cursor-default opacity-70'}`}
        >
          <span>{r.emoji}</span>
          <span className="tabular-nums font-bold">{r.count}</span>
        </button>
      ))}

      {canReact && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-label="Ajouter une réaction"
            className={`grid h-6 w-6 place-items-center rounded-full border border-white/10 text-bone-500 transition hover:border-white/25 hover:text-bone-200 ${
              has || pickerOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
            }`}
          >
            <SmilePlus size={13} />
          </button>

          {pickerOpen && (
            <>
              {/* clic en dehors → ferme */}
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute bottom-8 left-0 z-20 flex gap-1 rounded-full border border-white/10 bg-ink-900 px-2 py-1.5 shadow-xl">
                {REACTION_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { onToggle(e); setPickerOpen(false); }}
                    className="rounded-full px-1 text-base transition hover:scale-125"
                    title={`Réagir ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl bg-ink-900/60 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-2 w-16 rounded bg-white/5" />
          </div>

          <div className="mt-3 h-3 w-4/5 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function ChatError({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
      <AlertTriangle
        size={28}
        className="mx-auto text-red-400"
      />

      <h3 className="mt-3 font-bold text-red-400">
        Impossible de charger le chat
      </h3>

      <p className="mt-2 text-sm text-bone-400">
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
      >
        <RefreshCw size={15} />
        Réessayer
      </button>
    </div>
  );
}

function ChatEmpty({ isClubMode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
      <MessageCircle
        size={30}
        className="mx-auto text-bone-500"
      />

      <h3 className="mt-3 font-bold text-bone-200">
        Aucun message
      </h3>

      <p className="mt-2 text-sm text-bone-500">
        {isClubMode
          ? 'Sois le premier supporter à écrire dans le chat.'
          : 'Commence la discussion avec tes amis.'}
      </p>
    </div>
  );
}