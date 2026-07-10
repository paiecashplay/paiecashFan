import {
  Users,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export function ParticipantsPanel({
  mode = 'club',
  fans = [],
  club,
  loading = false,
  error = null,
  onRetry
}) {
  const isClubMode = mode === 'club';

  const participants = isClubMode
    ? fans
    : fans.slice(0, 4);

  const onlineParticipants = fans.filter(
    (fan) => fan.online
  ).length;

  const isEmpty =
    !loading &&
    !error &&
    participants.length === 0;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-bone-50">
        <Users
          size={20}
          style={{ color: club.primaryColor }}
        />

        {isClubMode
          ? 'Supporters connectés'
          : 'Mes amis'}
      </h2>

      <p className="mt-1 text-sm text-bone-400">
        {loading
          ? 'Chargement des participants...'
          : isClubMode
            ? `${onlineParticipants} supporter${onlineParticipants > 1 ? 's' : ''} en ligne`
            : `${participants.length} ami${participants.length > 1 ? 's' : ''} dans le salon`}
      </p>

      <div className="mt-5 space-y-3">
        {loading && <ParticipantsSkeleton />}

        {!loading && error && (
          <ParticipantsError
            error={error}
            onRetry={onRetry}
          />
        )}

        {isEmpty && (
          <ParticipantsEmpty
            isClubMode={isClubMode}
          />
        )}

        {!loading &&
          !error &&
          participants.map((fan) => (
            <div
              key={fan.id}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                {fan.avatar ? (
                  <img
                    src={fan.avatar}
                    alt={fan.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-xs font-bold text-bone-300">
                    {fan.initials ||
                      fan.name
                        ?.slice(0, 2)
                        .toUpperCase()}
                  </span>
                )}

                {fan.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-bone-100">
                  {fan.name}
                </p>

                <p className="text-[11px] text-bone-500">
                  {fan.online
                    ? 'En ligne'
                    : 'Hors ligne'}
                </p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}


function ParticipantsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-3 rounded-2xl bg-white/[0.04] p-3"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-white/10" />

            <div className="flex-1">
              <div className="h-3 w-28 rounded bg-white/10" />
              <div className="mt-2 h-2 w-16 rounded bg-white/5" />
            </div>
          </div>
        )
      )}
    </>
  );
}

function ParticipantsError({
  error,
  onRetry
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center">
      <AlertTriangle
        size={26}
        className="mx-auto text-red-400"
      />

      <p className="mt-3 text-sm font-bold text-red-400">
        Impossible de charger les participants
      </p>

      <p className="mt-2 text-xs text-bone-400">
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

function ParticipantsEmpty({
  isClubMode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <Users
        size={28}
        className="mx-auto text-bone-500"
      />

      <h3 className="mt-3 font-bold text-bone-200">
        Aucun participant
      </h3>

      <p className="mt-2 text-sm text-bone-500">
        {isClubMode
          ? 'Aucun supporter connecté pour le moment.'
          : 'Aucun ami dans ce salon privé.'}
      </p>
    </div>
  );
}