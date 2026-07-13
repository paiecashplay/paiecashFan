import { useState } from 'react';
import {
  Send,
  MessageCircle,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export function LiveChat({
  mode = 'club',
  club,
  messages = [],
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  onSendMessage
}) {
  const [message, setMessage] = useState('');

  const isClubMode = mode === 'club';

  function handleSend() {
    const cleanMessage = message.trim();

    if (!cleanMessage || loading || error) return;

    const sent = onSendMessage?.(cleanMessage);

    if (sent !== false) {
      setMessage('');
    }
  }

  return (
    <section className="flex h-full min-h-[360px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] sm:min-h-[420px]">
      <div className="border-b border-white/10 p-4 sm:p-5">
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

      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
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
              className="rounded-2xl bg-ink-900/60 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-bone-100">
                  {msg.author}
                </span>

                <span className="shrink-0 text-[10px] text-bone-500">
                  {msg.createdAt}
                </span>
              </div>

              <p className="mt-2 break-words text-sm text-bone-300">
                {msg.content}
              </p>
            </motion.div>
          ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2 sm:gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSend();
              }
            }}
            disabled={loading || Boolean(error)}
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
            disabled={!message.trim() || loading || Boolean(error)}
            aria-label="Envoyer le message"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: club.primaryColor }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
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