import { Users } from 'lucide-react';
import { onlineCount } from '@/data/clubMocks';

export function ParticipantsPanel({ mode = 'club', fans = [], club }) {
  const isClubMode = mode === 'club';

  const participants = isClubMode
    ? fans
    : fans.slice(0, 4);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-bone-50">
        <Users size={20} style={{ color: club.primaryColor }} />
        {isClubMode ? 'Supporters connectés' : 'Mes amis'}
      </h2>

      <p className="mt-1 text-sm text-bone-400">
        {isClubMode
          ? `${onlineCount(fans)} supporters en ligne`
          : `${participants.length} amis dans le salon`}
      </p>

      <div className="mt-5 space-y-3">
        {participants.map((fan) => (
          <div
            key={fan.id}
            className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white/10">
              {fan.avatar ? (
                <img
                  src={fan.avatar}
                  alt={fan.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-xs font-bold text-bone-300">
                  {fan.initials || fan.name?.slice(0, 2).toUpperCase()}
                </span>
              )}

              {fan.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-bone-100">
                {fan.name}
              </p>
              <p className="text-[11px] text-bone-500">
                {fan.online ? 'En ligne' : 'Hors ligne'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}