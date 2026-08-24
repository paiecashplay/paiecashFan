import { useState } from 'react';
import {
  motion,
  useReducedMotion,
} from 'framer-motion';

import {
  Shield,
  Sparkles,
  Users,
  UserRound,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';

/* ═══════════════════════════════════════════════════════════════
   Normalisation joueurs

   API-Football peut nous retourner deux formats :

   1. current_squad
      {
        id,
        name,
        age,
        number,
        position,
        photo
      }

   2. competition
      {
        player: {...},
        statistics: [...]
      }
═══════════════════════════════════════════════════════════════ */
function normalizePlayers(team) {
  const players = team?.players || [];

  return players
    .map((entry) => {
      /*
       * Format /players/squads
       */
      if (!entry?.player) {
        return {
          id: entry?.id,
          name:
            entry?.name ||
            'Joueur',
          age:
            entry?.age ??
            null,
          number:
            entry?.number ??
            null,
          position:
            entry?.position ||
            null,
          photo:
            entry?.photo ||
            null,
        };
      }

      /*
       * Format /players?team=&league=&season=
       */
      const statistics =
        entry.statistics?.[0] || {};

      const games =
        statistics.games || {};

      return {
        id:
          entry.player?.id,

        name:
          entry.player?.name ||
          'Joueur',

        age:
          entry.player?.age ??
          null,

        number:
          games.number ??
          null,

        position:
          games.position ||
          null,

        photo:
          entry.player?.photo ||
          null,
      };
    })
    .filter(
      (player) =>
        player.id != null
    );
}

/* ═══════════════════════════════════════════════════════════════
   Carte joueur
═══════════════════════════════════════════════════════════════ */
function PlayerCard({
  player,
  accent,
}) {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
        group/player
        relative
        flex
        min-w-0
        items-center
        gap-3
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.03]
        p-3
        transition-colors
        hover:border-white/[0.14]
        hover:bg-white/[0.05]
      "
    >
      {/* Halo */}
      <div
        className="
          pointer-events-none
          absolute
          -right-5
          -top-5
          h-16
          w-16
          rounded-full
          opacity-0
          blur-xl
          transition-opacity
          group-hover/player:opacity-10
        "
        style={{
          background:
            accent,
        }}
      />

      {/* Photo */}
      <div
        className="
          relative
          grid
          h-14
          w-14
          shrink-0
          place-items-center
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-ink-900
        "
      >
        {player.photo ? (
          <img
            src={
              player.photo
            }
            alt={
              player.name
            }
            loading="lazy"
            className="
              h-full
              w-full
              object-cover
            "
            onError={(
              event
            ) => {
              event.currentTarget.style.display =
                'none';
            }}
          />
        ) : (
          <UserRound
            size={21}
            style={{
              color:
                accent,
            }}
          />
        )}
      </div>

      {/* Infos */}
      <div
        className="
          relative
          min-w-0
          flex-1
        "
      >
        <p
          className="
            truncate
            text-sm
            font-semibold
            text-bone-100
          "
          title={
            player.name
          }
        >
          {player.name}
        </p>

        <div
          className="
            mt-1.5
            flex
            flex-wrap
            items-center
            gap-x-2
            gap-y-1
            text-[10px]
            text-bone-500
          "
        >
          {player.number !=
            null && (
            <span
              className="
                font-mono
                font-bold
              "
              style={{
                color:
                  accent,
              }}
            >
              #
              {
                player.number
              }
            </span>
          )}

          {player.age !=
            null && (
            <span>
              {
                player.age
              }{' '}
              ans
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Groupe de joueurs
═══════════════════════════════════════════════════════════════ */
function PlayerGroup({
  team,
  title,
  players,
  accent,
}) {
  return (
    <div>
      <div
        className="
          mb-4
          flex
          items-center
          gap-3
        "
      >
        <span
          className="
            h-px
            w-8
          "
          style={{
            background:
              accent,
          }}
        />

        <h4
          className="
            text-[10px]
            font-black
            uppercase
            tracking-[0.2em]
            text-bone-300
          "
        >
          {title}
        </h4>

        <span
          className="
            rounded-full
            border
            border-white/[0.08]
            bg-white/[0.03]
            px-2
            py-0.5
            text-[9px]
            text-bone-500
          "
        >
          {
            players.length
          }
        </span>
      </div>

      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {players.map(
          (player) => (
            <PlayerCard
              key={`${team.id}-${player.position || 'unknown'}-${player.id}`}
              player={
                player
              }
              accent={
                accent
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Panneau de l'effectif
═══════════════════════════════════════════════════════════════ */
function SquadPanel({
  team,
  accent,
  onClose,
}) {
  const players =
    normalizePlayers(
      team
    );

  const groups = [
    {
      key:
        'Goalkeeper',
      label:
        'Gardiens',
    },
    {
      key:
        'Defender',
      label:
        'Défenseurs',
    },
    {
      key:
        'Midfielder',
      label:
        'Milieux',
    },
    {
      key:
        'Attacker',
      label:
        'Attaquants',
    },
  ];

  const knownPositions =
    groups.map(
      (group) =>
        group.key
    );

  const unknownPlayers =
    players.filter(
      (player) =>
        !knownPositions.includes(
          player.position
        )
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.99,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.4,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      className="
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/[0.08]
        bg-ink-950/95
        p-5
        shadow-2xl
        backdrop-blur-xl
        md:p-7
      "
    >
      {/* Halo */}
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-64
          w-64
          rounded-full
          opacity-10
          blur-3xl
        "
        style={{
          background:
            accent,
        }}
      />

      {/* Trait supérieur */}
      <div
        className="
          pointer-events-none
          absolute
          left-10
          right-10
          top-0
          h-px
          opacity-70
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              ${accent},
              transparent
            )
          `,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.24em]
              "
              style={{
                color:
                  accent,
              }}
            >
              <Users
                size={13}
              />

              Effectif
            </div>

            <h3
              className="
                mt-2
                font-display
                text-2xl
                font-black
                uppercase
                tracking-tight
                text-bone-50
                md:text-3xl
              "
            >
              {
                team.name
              }
            </h3>

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-bone-300
                "
              >
                {
                  players.length
                }{' '}
                {players.length >
                1
                  ? 'joueurs'
                  : 'joueur'}
              </span>

              {team.playersSource ===
                'competition' &&
                team
                  .playersCompetition
                  ?.leagueName && (
                  <span
                    className="
                      rounded-full
                      border
                      px-3
                      py-1.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                    "
                    style={{
                      color:
                        accent,
                      borderColor:
                        `${accent}30`,
                      background:
                        `${accent}0D`,
                    }}
                  >
                    {
                      team
                        .playersCompetition
                        .leagueName
                    }

                    {team
                      .playersCompetition
                      ?.season
                      ? ` · ${team.playersCompetition.season}`
                      : ''}
                  </span>
                )}

              {team.playersSource ===
                'current_squad' && (
                <span
                  className="
                    rounded-full
                    border
                    border-white/[0.08]
                    bg-white/[0.03]
                    px-3
                    py-1.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-bone-500
                  "
                >
                  Effectif
                  actuel
                </span>
              )}
            </div>
          </div>

          {/* Fermer */}
          <button
            type="button"
            onClick={
              onClose
            }
            aria-label={`Fermer l'effectif de ${team.name}`}
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-full
              border
              border-white/10
              bg-white/[0.04]
              text-bone-300
              transition
              hover:border-white/20
              hover:bg-white/[0.08]
              hover:text-white
            "
          >
            <X
              size={17}
            />
          </button>
        </div>

        {/* Aucun joueur */}
        {players.length ===
        0 ? (
          <div
            className="
              mt-8
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              px-5
              py-10
              text-center
            "
          >
            <div
              className="
                mx-auto
                grid
                h-12
                w-12
                place-items-center
                rounded-full
                border
                border-white/10
                bg-white/[0.04]
              "
            >
              <Users
                size={20}
                style={{
                  color:
                    accent,
                }}
              />
            </div>

            <p
              className="
                mt-4
                text-sm
                font-semibold
                text-bone-200
              "
            >
              Effectif
              indisponible
            </p>

            <p
              className="
                mx-auto
                mt-2
                max-w-md
                text-xs
                leading-relaxed
                text-bone-500
              "
            >
              API-Football
              ne fournit
              actuellement
              aucun joueur
              pour cette
              sélection.
            </p>
          </div>
        ) : (
          <div
            className="
              mt-8
              space-y-9
            "
          >
            {groups.map(
              (group) => {
                const groupPlayers =
                  players.filter(
                    (
                      player
                    ) =>
                      player.position ===
                      group.key
                  );

                if (
                  groupPlayers.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <PlayerGroup
                    key={
                      group.key
                    }
                    team={
                      team
                    }
                    title={
                      group.label
                    }
                    players={
                      groupPlayers
                    }
                    accent={
                      accent
                    }
                  />
                );
              }
            )}

            {unknownPlayers.length >
              0 && (
              <PlayerGroup
                key="other"
                team={
                  team
                }
                title="Autres joueurs"
                players={
                  unknownPlayers
                }
                accent={
                  accent
                }
              />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Carte sélection
═══════════════════════════════════════════════════════════════ */
function TeamCard({
  team,
  accent,
  index,
  reduce,
  onOpenSquad,
  loading,
  unavailable,
}) {
  const isWomen =
    team.gender ===
    'female';

  const isSenior =
    team.category ===
    'senior';

  const TypeIcon =
    isSenior
      ? isWomen
        ? UserRound
        : Shield
      : Users;

  const categoryLabel =
    isSenior
      ? isWomen
        ? 'Sélection féminine'
        : 'Sélection masculine'
      : `${
          team.category
        } · ${
          isWomen
            ? 'Féminine'
            : 'Masculine'
        }`;

  return (
    <motion.article
      initial={
        reduce
          ? undefined
          : {
              opacity: 0,
              y: 20,
              scale:
                0.985,
            }
      }
      whileInView={
        reduce
          ? undefined
          : {
              opacity: 1,
              y: 0,
              scale: 1,
            }
      }
      viewport={{
        once: true,
        amount: 0.2,
      }}
      transition={{
        duration: 0.5,
        delay:
          index *
          0.04,
        ease: [
          0.22,
          1,
          0.36,
          1,
        ],
      }}
      whileHover={
        reduce
          ? undefined
          : {
              y: -4,
            }
      }
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-white/[0.08]
        bg-white/[0.035]
        backdrop-blur-xl
        transition-colors
        duration-300
        hover:border-white/[0.18]
      "
    >
      {/* Halo */}
      <div
        className="
          pointer-events-none
          absolute
          -right-14
          -top-16
          h-44
          w-44
          rounded-full
          opacity-[0.14]
          blur-3xl
          transition-opacity
          duration-500
          group-hover:opacity-[0.26]
        "
        style={{
          background:
            accent,
        }}
      />

      {/* Ligne supérieure */}
      <div
        className="
          pointer-events-none
          absolute
          left-7
          right-7
          top-0
          h-px
          opacity-70
        "
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent,
              ${accent},
              transparent
            )
          `,
        }}
      />

      <div
        className="
          relative
          flex
          h-full
          flex-col
          p-5
        "
      >
        {/* Catégorie */}
        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div
            className="
              inline-flex
              min-w-0
              items-center
              gap-2
              rounded-full
              border
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
            "
            style={{
              color:
                accent,
              borderColor:
                `${accent}35`,
              background:
                `${accent}12`,
            }}
          >
            <TypeIcon
              size={12}
              className="shrink-0"
            />

            <span className="truncate">
              {
                categoryLabel
              }
            </span>
          </div>

          {team.national ===
            true && (
            <div
              title="Sélection nationale"
              className="
                grid
                h-8
                w-8
                shrink-0
                place-items-center
                rounded-full
                border
                border-white/10
                bg-white/[0.04]
              "
            >
              <Sparkles
                size={13}
                style={{
                  color:
                    accent,
                }}
              />
            </div>
          )}
        </div>

        {/* Logo */}
        <div
          className="
            mt-6
            flex
            justify-center
          "
        >
          <div className="relative">
            <div
              className="
                absolute
                inset-0
                scale-125
                rounded-full
                opacity-20
                blur-2xl
              "
              style={{
                background:
                  accent,
              }}
            />

            <div
              className="
                relative
                grid
                h-24
                w-24
                place-items-center
                rounded-[22px]
                border
                border-white/10
                bg-ink-900/70
                p-4
                shadow-xl
              "
            >
              {team.logo ? (
                <img
                  src={
                    team.logo
                  }
                  alt={
                    team.name
                  }
                  loading="lazy"
                  className="
                    max-h-full
                    max-w-full
                    object-contain
                    drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.style.display =
                      'none';
                  }}
                />
              ) : (
                <Shield
                  size={36}
                  style={{
                    color:
                      accent,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Nom */}
        <div
          className="
            mt-5
            text-center
          "
        >
          <h3
            className="
              font-display
              text-lg
              font-black
              uppercase
              tracking-tight
              text-bone-50
              md:text-xl
            "
          >
            {
              team.name
            }
          </h3>

          {team.country && (
            <p
              className="
                mt-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-bone-500
              "
            >
              {
                team.country
              }
            </p>
          )}
        </div>

        {/* Informations */}
        {(team.stadium ||
          team.city ||
          team.founded) && (
          <div
            className="
              mt-5
              grid
              gap-px
              overflow-hidden
              rounded-xl
              border
              border-white/[0.06]
              bg-white/[0.06]
            "
          >
            {team.stadium && (
              <TeamMeta
                label="Stade"
                value={
                  team.stadium
                }
              />
            )}

            {team.city && (
              <TeamMeta
                label="Ville"
                value={
                  team.city
                }
              />
            )}

            {team.founded && (
              <TeamMeta
                label="Depuis"
                value={
                  team.founded
                }
              />
            )}
          </div>
        )}

        {/* Bouton lazy loading */}
        <div className="mt-auto pt-5">
            {unavailable ? (
                <div
                className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    px-4
                    py-3
                    opacity-70
                "
                >
                <div>
                    <p
                    className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                    "
                    style={{
                        color: accent,
                    }}
                    >
                    Effectif
                    </p>

                    <p
                    className="
                        mt-1
                        text-xs
                        font-semibold
                        text-bone-500
                    "
                    >
                    Effectif indisponible
                    </p>
                </div>

                <Users
                    size={17}
                    className="text-bone-600"
                />
                </div>
            ) : (
                <button
                type="button"
                disabled={loading}
                onClick={() =>
                    onOpenSquad(team)
                }
                className="
                    group/button
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-white/[0.08]
                    bg-white/[0.035]
                    px-4
                    py-3
                    text-left
                    transition
                    hover:border-white/[0.16]
                    hover:bg-white/[0.06]
                    disabled:cursor-wait
                    disabled:opacity-70
                "
                >
                <div>
                    <p
                    className="
                        text-[9px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                    "
                    style={{
                        color: accent,
                    }}
                    >
                    Effectif
                    </p>

                    <p
                    className="
                        mt-1
                        text-xs
                        font-semibold
                        text-bone-200
                    "
                    >
                    {loading
                        ? 'Chargement...'
                        : "Voir l'effectif"}
                    </p>
                </div>

                {loading ? (
                    <Loader2
                    size={17}
                    className="animate-spin"
                    style={{
                        color: accent,
                    }}
                    />
                ) : (
                    <ChevronRight
                    size={17}
                    className="
                        text-bone-500
                        transition-transform
                        group-hover/button:translate-x-1
                    "
                    />
                )}
                </button>
            )}
        </div>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Ligne information équipe
═══════════════════════════════════════════════════════════════ */
function TeamMeta({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-3
        bg-ink-900/70
        px-3.5
        py-2.5
      "
    >
      <span
        className="
          shrink-0
          text-[8px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-bone-500
        "
      >
        {label}
      </span>

      <span
        className="
          min-w-0
          truncate
          text-right
          text-[10px]
          font-medium
          text-bone-200
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Titre groupe
═══════════════════════════════════════════════════════════════ */
function SectionTitle({
  eyebrow,
  title,
  count,
  accent,
}) {
  return (
    <div
      className="
        mb-5
        flex
        items-end
        justify-between
        gap-5
      "
    >
      <div>
        <div
          className="
            flex
            items-center
            gap-3
            text-[9px]
            font-black
            uppercase
            tracking-[0.24em]
          "
          style={{
            color:
              accent,
          }}
        >
          <span
            className="
              h-px
              w-8
            "
            style={{
              background:
                accent,
            }}
          />

          {eyebrow}
        </div>

        <h3
          className="
            mt-2
            font-display
            text-2xl
            font-black
            uppercase
            tracking-tight
            text-bone-50
            md:text-3xl
          "
        >
          {title}
        </h3>
      </div>

      <span
        className="
          hidden
          h-9
          min-w-9
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-white/[0.04]
          px-3
          font-mono
          text-xs
          text-bone-300
          sm:inline-flex
        "
      >
        {count}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Section principale
═══════════════════════════════════════════════════════════════ */
export default function NationalTeamsSection({
  teams,
  federationColor = '#10b981',
}) {
  const reduce =
    useReducedMotion();

  /*
   * Équipe dont l'effectif
   * est actuellement affiché.
   */
  const [
    selectedTeam,
    setSelectedTeam,
  ] = useState(null);

  /*
   * ID de l'équipe actuellement
   * en cours de chargement.
   */
  const [
    loadingTeamId,
    setLoadingTeamId,
  ] = useState(null);

  /*
   * Message d'erreur éventuel.
   */
  const [
    squadError,
    setSquadError,
  ] = useState('');

  /*
   * Petit cache frontend :
   * si l'utilisateur ferme puis rouvre
   * la même équipe, on évite une nouvelle
   * requête API-Football.
   *
   * {
   *   1505: {...team avec players},
   *   2: {...}
   * }
   */
  const [
    squadCache,
    setSquadCache,
  ] = useState({});

  const [
    unavailableTeamIds,
    setUnavailableTeamIds,
  ] = useState([]);

  const men =
    teams?.men || [];

  const women =
    teams?.women || [];

  const youth =
    teams?.youth || [];

  const total =
    men.length +
    women.length +
    youth.length;

  if (total === 0) {
    return null;
  }

  /* ═════════════════════════════════════════════════════════════
     Chargement lazy de l'effectif
  ═════════════════════════════════════════════════════════════ */
  async function handleOpenSquad(
    team
  ) {
    if (!team?.id) {
      return;
    }

    setSquadError('');

    /*
     * Si déjà présent dans le cache,
     * on ne refait pas la requête.
     */
    if (
      squadCache[
        team.id
      ]
    ) {
      setSelectedTeam(
        squadCache[
          team.id
        ]
      );

      window.setTimeout(
        () => {
          document
            .getElementById(
              'national-team-squad'
            )
            ?.scrollIntoView(
              {
                behavior:
                  'smooth',
                block:
                  'start',
              }
            );
        },
        50
      );

      return;
    }

    try {
      setLoadingTeamId(
        team.id
      );

      const response =
        await fetch(
          `/api/v2/marketplace/federations/national-teams/${team.id}/players`,
          {
            method:
              'GET',
            headers: {
              Accept:
                'application/json',
            },
          }
        );

      const json =
        await response.json();

      if (
        !response.ok ||
        !json?.success
      ) {
        throw new Error(
          json?.error ||
            "Impossible de récupérer l'effectif."
        );
      }

      const apiTeam =
        json?.data?.team;

      const playersCount =
        apiTeam?.players?.length || 0;

      if (playersCount === 0) {
        setUnavailableTeamIds((previous) => {
            if (previous.includes(team.id)) {
            return previous;
            }

            return [
            ...previous,
            team.id,
            ];
        });

        setSelectedTeam(null);

        return;
        }

      if (!apiTeam) {
        throw new Error(
          "L'effectif retourné est invalide."
        );
      }

      /*
       * On conserve les informations
       * de catégorie/gender présentes
       * sur la carte originale.
       *
       * getTeam(teamId) côté backend
       * ne renvoie pas forcément ces
       * propriétés.
       */
      const enrichedTeam =
        {
          ...team,
          ...apiTeam,

          gender:
            team.gender,

          category:
            team.category,
        };

      /*
       * Cache frontend.
       */
      setSquadCache(
        (previous) => ({
          ...previous,

          [team.id]:
            enrichedTeam,
        })
      );

      setSelectedTeam(
        enrichedTeam
      );

      /*
       * Attendre que React ait affiché
       * le panneau avant le scroll.
       */
      window.setTimeout(
        () => {
          document
            .getElementById(
              'national-team-squad'
            )
            ?.scrollIntoView(
              {
                behavior:
                  'smooth',
                block:
                  'start',
              }
            );
        },
        50
      );
    } catch (error) {
      console.error(
        '[NationalTeamsSection] squad error:',
        error
      );

      setSquadError(
        error?.message ||
          "Impossible de charger l'effectif."
      );
    } finally {
      setLoadingTeamId(
        null
      );
    }
  }

  return (
    <section
      id="national-teams"
      className="
        relative
        overflow-hidden
        border-b
        border-white/5
        py-12
        md:py-16
      "
    >
      {/* Background */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.07]
        "
        style={{
          background: `
            radial-gradient(
              circle at 12% 18%,
              ${federationColor},
              transparent 30%
            ),
            radial-gradient(
              circle at 88% 72%,
              ${federationColor},
              transparent 26%
            )
          `,
        }}
      />

      <Container className="relative">
        {/* ═══ HEADER ═══════════════════════════════════════ */}
        <div
          className="
            mb-10
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            md:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.28em]
              "
              style={{
                color:
                  federationColor,
              }}
            >
              <Sparkles
                size={13}
              />

              Sélections
            </div>

            <h2
              className="
                mt-3
                font-display
                text-3xl
                font-black
                uppercase
                tracking-tight
                text-bone-50
                md:text-4xl
              "
            >
              Équipes
              nationales
            </h2>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-bone-400
              "
            >
              Les sélections
              masculines,
              féminines et
              jeunes rattachées
              à cette fédération.
            </p>
          </div>

          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-3
              rounded-full
              border
              border-white/10
              bg-white/[0.035]
              px-4
              py-2
              backdrop-blur-md
            "
          >
            <Users
              size={14}
              style={{
                color:
                  federationColor,
              }}
            />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-bone-400
              "
            >
              {total}{' '}
              {total > 1
                ? 'sélections'
                : 'sélection'}
            </span>
          </div>
        </div>

        {/* ═══ SENIORS ═══════════════════════════════════════ */}
        {(men.length >
          0 ||
          women.length >
            0) && (
          <div className="mb-12">
            <SectionTitle
              eyebrow="Équipes A"
              title="Sélections seniors"
              count={
                men.length +
                women.length
              }
              accent={
                federationColor
              }
            />

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {men.map(
                (
                  team,
                  index
                ) => (
                  <TeamCard
                    key={`senior-men-${team.id}`}
                    team={
                      team
                    }
                    accent={
                      federationColor
                    }
                    index={
                      index
                    }
                    reduce={
                      reduce
                    }
                    loading={
                      loadingTeamId ===
                      team.id
                    }
                    unavailable={
                      unavailableTeamIds.includes(team.id)
                    }
                    onOpenSquad={
                      handleOpenSquad
                    }
                  />
                )
              )}

              {women.map(
                (
                  team,
                  index
                ) => (
                  <TeamCard
                    key={`senior-women-${team.id}`}
                    team={
                      team
                    }
                    accent={
                      federationColor
                    }
                    index={
                      men.length +
                      index
                    }
                    reduce={
                      reduce
                    }
                    loading={
                      loadingTeamId ===
                      team.id
                    }
                    unavailable={
                      unavailableTeamIds.includes(team.id)
                    }
                    onOpenSquad={
                      handleOpenSquad
                    }
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* ═══ JEUNES ════════════════════════════════════════ */}
        {youth.length >
          0 && (
          <div>
            <SectionTitle
              eyebrow="Formation"
              title="Sélections jeunes"
              count={
                youth.length
              }
              accent={
                federationColor
              }
            />

            <div
              className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {youth.map(
                (
                  team,
                  index
                ) => (
                  <TeamCard
                    key={`youth-${team.gender}-${team.category}-${team.id}`}
                    team={
                      team
                    }
                    accent={
                      federationColor
                    }
                    index={
                      index
                    }
                    reduce={
                      reduce
                    }
                    loading={
                      loadingTeamId ===
                      team.id
                    }
                    unavailable={
                      unavailableTeamIds.includes(team.id)
                    }
                    onOpenSquad={
                      handleOpenSquad
                    }
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* ═══ ERREUR CHARGEMENT EFFECTIF ════════════════════ */}
        {squadError && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mt-10
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-400/20
              bg-red-400/[0.05]
              p-4
            "
          >
            <AlertCircle
              size={18}
              className="
                mt-0.5
                shrink-0
                text-red-300
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                  text-red-100
                "
              >
                Impossible
                de charger
                l'effectif
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-red-200/60
                "
              >
                {
                  squadError
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* ═══ EFFECTIF SÉLECTIONNÉ ══════════════════════════ */}
        {selectedTeam && (
          <div
            id="national-team-squad"
            className="
              scroll-mt-24
              pt-12
            "
          >
            <SquadPanel
              team={
                selectedTeam
              }
              accent={
                federationColor
              }
              onClose={() => {
                setSelectedTeam(
                  null
                );

                setSquadError(
                  ''
                );
              }}
            />
          </div>
        )}
      </Container>
    </section>
  );
}