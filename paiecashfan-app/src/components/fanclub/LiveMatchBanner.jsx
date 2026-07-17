import { Radio, Users, Heart, MessageCircle } from 'lucide-react';

const formatCount = (value) => new Intl.NumberFormat('fr-FR').format(Number(value || 0));

// Bandeau "match en direct" du Fan Club.
// Données issues du hook useFanFeed (prop `match`), avec repli sûr si absente.
// Layout responsive (mobile → desktop).
export function LiveMatchBanner({ mode, match }) {
  const m = match || {};
  const homeTeam    = m.homeTeam    ?? 'Paris Saint-Germain';
  const awayTeam    = m.awayTeam    ?? 'Marseille';
  const homeScore   = m.homeScore   ?? 2;
  const awayScore   = m.awayScore   ?? 1;
  const competition = m.competition ?? 'Ligue 1';
  const minute      = m.minute      ?? 85;
  const supporters  = formatCount(m.supportersCount)  ?? '';
  const messages    = formatCount(m.messagesCount)   ?? '';
  const reactions   = formatCount(m.reactionsCount)   ?? '';

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-red-400">
            <Radio size={18} />
            <span className="text-xs font-black uppercase">
              En direct
            </span>
          </div>

          <h2 className="mt-3 break-words text-2xl font-black text-bone-50 sm:text-3xl">
            {homeTeam}
            <span className="mx-2 text-bone-500 sm:mx-4">
              {homeScore} - {awayScore}
            </span>
            {awayTeam}
          </h2>

          <p className="mt-2 text-sm text-bone-400">
            {competition} • {minute}' • {mode === 'club' ? 'Chat public' : 'Salon privé'}
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 overflow-hidden sm:gap-3 xl:w-auto">
          <Stat icon={<Users size={18} />} value={supporters} label="Supporters" />
          <Stat icon={<MessageCircle size={18} />} value={messages} label="Messages" />
          <Stat icon={<Heart size={18} />} value={reactions} label="Réactions" />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.04] p-2 text-center sm:p-4">
      <div className="mb-2 flex justify-center text-emerald-400">
        {icon}
      </div>

      <p className="break-words text-sm font-black leading-tight text-bone-50 sm:text-xl">
        {value}
      </p>

      <p className="break-words text-[8px] font-bold uppercase tracking-[0.08em] text-bone-500 sm:text-xs sm:tracking-[0.15em]">
        {label}
      </p>
    </div>
  );
}
