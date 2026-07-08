import { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const initialClubMessages = [
  {
    id: 'm1',
    author: 'Ahmed',
    content: 'Allez le club 🔥',
    createdAt: 'Maintenant'
  },
  {
    id: 'm2',
    author: 'Sophie',
    content: 'Quelqu’un regarde le match ?',
    createdAt: 'Il y a 1 min'
  }
];

const initialFriendsMessages = [
  {
    id: 'fm1',
    author: 'Moi',
    content: 'Bienvenue dans mon salon privé 👥',
    createdAt: 'Maintenant'
  }
];

export function LiveChat({ mode = 'club', club }) {
  const [message, setMessage] = useState('');
  const [clubMessages, setClubMessages] = useState(initialClubMessages);
  const [friendsMessages, setFriendsMessages] = useState(initialFriendsMessages);

  const isClubMode = mode === 'club';
  const messages = isClubMode ? clubMessages : friendsMessages;
  const setMessages = isClubMode ? setClubMessages : setFriendsMessages;

  function handleSend() {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        author: isClubMode ? 'Supporter' : 'Moi',
        content: message.trim(),
        createdAt: 'Maintenant'
      }
    ]);

    setMessage('');
  }

  return (
    <section className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/10 p-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-bone-50">
          <MessageCircle size={20} style={{ color: club.primaryColor }} />
          {isClubMode ? 'Chat Fan Club' : 'Chat privé'}
        </h2>

        <p className="mt-1 text-sm text-bone-400">
          {isClubMode
            ? 'Discute en direct avec tous les supporters.'
            : 'Discute uniquement avec tes amis pendant le live.'}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl bg-ink-900/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-bone-100">
                {msg.author}
              </span>
              <span className="text-[10px] text-bone-500">
                {msg.createdAt}
              </span>
            </div>

            <p className="mt-2 text-sm text-bone-300">
              {msg.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              isClubMode
                ? 'Écris dans le chat du Fan Club...'
                : 'Écris à tes amis...'
            }
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none placeholder:text-bone-500"
          />

          <button
            onClick={handleSend}
            className="grid h-11 w-11 place-items-center rounded-xl text-white"
            style={{ background: club.primaryColor }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}