import { Radio, Users, Heart, MessageCircle, CalendarClock, CircleCheck } from 'lucide-react';

const formatCount = (value) => new Intl.NumberFormat('fr-FR').format(Number(value || 0));

// Date de coup d'envoi lisible (ex : « sam. 5 août, 20:00 »).
function formatKickoff(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Bandeau « match » du Fan Club — données réelles API-Football (prop `match`)
// + compteurs réels du salon (prop `counters`). Gère les états : en direct,
// à venir, terminé, ou aucun match (état neutre).
export function LiveMatchBanner({ mode, match, counters = {} }) {
  const supporters = formatCount(counters.supportersCount);
  const messages   = formatCount(counters.messagesCount);
  const reactions  = formatCount(counters.reactionsCount);

  const hasMatch   = !!(match && match.homeTeam && match.awayTeam);
  const isLive     = match?.status === 'LIVE';
  const isUpcoming = match?.status === 'NS';
  const hasScore   = isLive || match?.status === 'FT';

  // En-tête (pastille d'état).
  let badge;
  if (isLive) {
    badge = (
      <div className="flex items-center gap-2 text-red-400">
        <Radio size={18} /><span className="text-xs font-black uppercase">En direct</span>
      </div>
    );
  } else if (isUpcoming) {
    badge = (
      <div className="flex items-center gap-2 text-emerald-400">
        <CalendarClock size={18} /><span className="text-xs font-black uppercase">Prochain match</span>
      </div>
    );
  } else if (hasMatch) {
    badge = (
      <div className="flex items-center gap-2 text-bone-400">
        <CircleCheck size={18} /><span className="text-xs font-black uppercase">Terminé</span>
      </div>
    );
  } else {
    badge = (
      <div className="flex items-center gap-2 text-bone-400">
        <Radio size={18} /><span className="text-xs font-black uppercase">Fan Club</span>
      </div>
    );
  }

  // Ligne sous le titre.
  let subline;
  if (isLive) {
    subline = `${match.competition || ''}${match.minute != null ? ` • ${match.minute}'` : ''} • ${mode === 'club' ? 'Chat public' : 'Salon privé'}`;
  } else if (isUpcoming) {
    subline = `${match.competition || ''}${match.kickoff ? ` • ${formatKickoff(match.kickoff)}` : ''}`;
  } else if (hasMatch) {
    subline = `${match.competition || ''} • Score final`;
  } else {
    subline = mode === 'club' ? 'Salon officiel des supporters' : 'Salon privé';
  }

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          {badge}

          {hasMatch ? (
            <h2 className="mt-3 break-words text-2xl font-black text-bone-50 sm:text-3xl">
              {match.homeTeam}
              <span className="mx-2 text-bone-500 sm:mx-4">
                {hasScore ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}` : 'vs'}
              </span>
              {match.awayTeam}
            </h2>
          ) : (
            <h2 className="mt-3 break-words text-2xl font-black text-bone-50 sm:text-3xl">
              Aucun match en cours
            </h2>
          )}

          <p className="mt-2 text-sm text-bone-400">{subline}</p>
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
