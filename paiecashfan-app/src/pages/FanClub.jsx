import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {  Video, Users, Radio, LogIn} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';

import { Container } from '@/components/ui/Container';
import { ClubFanCommunity } from '@/components/club/ClubFanCommunity';
import { FavoriteClubButton } from '@/components/club/FavoriteClubButton';
import { LiveChat } from '@/components/fanclub/LiveChat';
import { CharterEntryModal } from '@/components/fanclub/CharterEntryModal';
import { ReportMessageModal } from '@/components/fanclub/ReportMessageModal';
import { ActiveSanctionBanner } from '@/components/fanclub/ActiveSanctionBanner';
import { BlockedMessageModal } from '@/components/fanclub/BlockedMessageModal';
import { ParticipantsPanel } from '@/components/fanclub/ParticipantsPanel';
import { LiveMatchBanner } from '@/components/fanclub/LiveMatchBanner';
import { LiveQuickActions } from '@/components/fanclub/LiveQuickActions';
import { useFanFeed } from '@/hooks/useFanFeed';
import { useClubDetail } from '@/hooks/useClubDetail';
import { usePresence } from '@/hooks/usePresence';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import { useStream } from '@/hooks/useStream';
import { StreamPlayer } from '@/components/fanclub/StreamPlayer';


// Club par défaut quand on arrive sur /fan-club sans slug.
const DEFAULT_SLUG = 'paris-saint-germain';

export function FanClub() {
  const { slug: routeSlug } = useParams();
  const slug = routeSlug || DEFAULT_SLUG;
  const { club: dbClub } = useClubDetail(slug);

  const club = {
    slug,
    id: dbClub?.id || null,
    name: dbClub?.name || 'Fan Club',
    primaryColor: dbClub?.primaryColor || dbClub?.primary_color || '#004170',
    logo: dbClub?.logo || dbClub?.logo_url || null,
  };

  const { user } = useAuth();
  const [mode, setMode] = useState('club');

  // Présence en ligne : battement de cœur tant qu'on est dans le salon d'un club
  // (connecté). Le backend en déduit qui est « en ligne » dans ce salon.
  usePresence(slug, mode === 'club' && !!user);
  // Vrai match du club (API-Football) : live > prochain > dernier.
  const { match: liveMatch } = useLiveMatch(slug);
  // Live vidéo officiel (embed YouTube/Twitch réglé au BO du club).
  const stream = useStream(slug);
  const {
    fans,
    posts,
    comments,
    loading: feedLoading,
    error: feedError,
    isEmpty: feedIsEmpty,
    reload: reloadFeed,
    publishPost,
    updatePost,
    deletePost,
    likePost,
    addComment,
    updateComment,
    deleteComment,
    messages,
    isChatEmpty,
    sendMessage,
    updateMessage,
    deleteMessage,
    toggleMessageReaction,
    counters
  } = useFanFeed(slug, mode, {
    // Refus de l'IA avant publication : on explique, on ne montre pas d'erreur brute.
    onModerationBlock: (moderation, draft) => {
      setBlocked({ moderation, draft });
      if (moderation.suspended) loadAccess();   // lecture seule → rafraîchit le bandeau
    },
    // Refus d'accès (403) : charte manquante → on rouvre la modale d'acceptation ;
    // sanction → on rafraîchit l'accès pour afficher le bandeau. Auto-réparant :
    // le supporter n'est jamais coincé sans savoir quoi faire.
    onAccessDenied: (data) => {
      loadAccess();
      if (data?.needsCharter) { setCharterDismissed(false); setCharterOpen(true); }
    },
  });
  
  const [newPost, setNewPost] = useState('');

  // ── Modération du salon (charte + signalement) ──────────────
  const [access, setAccess] = useState(null);      // état d'accès (favori ? charte ? sanction ?)
  const [charterOpen, setCharterOpen] = useState(false);
  const [charterBusy, setCharterBusy] = useState(false);
  const [charterDismissed, setCharterDismissed] = useState(false);   // « Plus tard » → ne pas ré-ouvrir
  const [reportTarget, setReportTarget] = useState(null);
  // Refus de publication par l'IA (lot 6) : { moderation, draft }
  const [blocked, setBlocked] = useState(null);
  const [hiddenUsers, setHiddenUsers] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('pcf:hiddenUsers') || '[]')); } catch { return new Set(); }
  });

  const loadAccess = useCallback(() => {
    if (mode !== 'club' || !slug) return;
    apiFetch(`/api/v2/clubs/${slug}/chat-access`)
      .then((j) => setAccess(j.data || null))
      .catch(() => setAccess(null));
  }, [slug, mode]);
  useEffect(() => { loadAccess(); }, [loadAccess, user]);

  // À l'ENTRÉE dans le salon : si la charte (version courante) n'est pas signée,
  // on l'affiche — version renforcée si le club n'est pas dans les favoris.
  useEffect(() => {
    if (mode !== 'club' || charterDismissed) return;
    if (access?.isLoggedIn && access.needsCharter) setCharterOpen(true);
  }, [access, mode, charterDismissed]);

  // Changement de salon → on réarme la charte.
  useEffect(() => { setCharterDismissed(false); setCharterOpen(false); }, [slug]);

  async function acceptCharter() {
    setCharterBusy(true);
    try { await apiFetch(`/api/v2/clubs/${slug}/chat-charter/accept`, { method: 'POST' }); setCharterOpen(false); loadAccess(); }
    catch { /* silencieux */ }
    setCharterBusy(false);
  }

  // Envoi de message : même garde que les publications (charte + sanction).
  function handleSendMessage(content) {
    if (!ensureCanWrite()) return false;
    return sendMessage(content);
  }

  // Le signalement couvre les 3 surfaces : chat, posts et commentaires.
  const REPORT_PATH = { message: 'messages', post: 'posts', comment: 'comments' };

  async function submitReport({ reason, comment }) {
    const path = REPORT_PATH[reportTarget?.contentType || 'message'];
    const j = await apiFetch(`/api/v2/clubs/${slug}/fan-feed/${path}/${reportTarget.id}/report`, {
      method: 'POST', body: JSON.stringify({ reason, comment }),
    });
    return j;
  }

  function hideUser(userId) {
    setHiddenUsers((prev) => {
      const next = new Set(prev); next.add(userId);
      try { localStorage.setItem('pcf:hiddenUsers', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }

  // Messages filtrés des utilisateurs masqués localement par le fan.
  const visibleMessages = (messages || []).filter((m) => !hiddenUsers.has(m.authorId));

  const [liveReactions, setLiveReactions] = useState([]);

  const [fanPoints, setFanPoints] = useState(0);

  // Toute tentative d'écriture (chat, publication, commentaire) exige la charte.
  // Renvoie false et ouvre la modale si elle n'est pas signée / si sanction.
  function ensureCanWrite() {
    if (mode !== 'club') return true;
    if (!user) return false;
    // Accès pas encore chargé : on ne prend pas le risque de laisser passer un
    // message sans avoir vérifié la charte (sinon 403 côté serveur, message
    // perdu). On relance le chargement et on bloque le temps de savoir.
    if (!access) { loadAccess(); return false; }
    if (access.activeSanction) return false;
    if (access.needsCharter) { setCharterDismissed(false); setCharterOpen(true); return false; }
    return true;
  }

  function handlePublish() {
    if (!ensureCanWrite()) return;
    const published = publishPost(newPost);

    if (published) {
      setNewPost('');
    }
  }

  function handleUpdatePost(postId, content) {
    if (!ensureCanWrite()) return false;

    return updatePost(postId, content);
  }

  function handleDeletePost(postId) {
    return deletePost(postId);
  }



  function handleLikePost(postId) {
    likePost(postId);
  }

  function handleAddComment(postId, content) {
    if (!ensureCanWrite()) return;
    addComment(postId, content);
  }

  function handleUpdateComment(commentId, content) {
    if (!ensureCanWrite()) return false;

    return updateComment(commentId, content);
  }

  function handleDeleteComment(commentId) {
    return deleteComment(commentId);
  }

  function handleLiveReaction(emoji) {
    setLiveReactions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        emoji
      }
    ]);

    setFanPoints((prev) => prev + 5);

    setTimeout(() => {
      setLiveReactions((prev) => prev.slice(1));
    }, 1800);
  }

  return (
    <section className="py-16 md:py-20">
      <Container>
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl opacity-30"
            style={{ background: club.primaryColor }}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">
                <Radio size={13} />
                Fan Club Live
              </div>

              {/* ⭐ Suivre ce club en favori directement depuis le salon */}
              {club.id && <FavoriteClubButton tenantId={club.id} />}
            </div>

            <h1 className="mt-5 break-words font-display text-3xl font-black uppercase text-bone-50 sm:text-4xl md:text-6xl">
              {club.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-bone-400">
              Regarde le live officiel du club, échange avec tous les supporters ou crée ton espace privé avec tes amis.
            </p>
          </div>
        </header>

        {/* Sanction active → bandeau en tête du salon */}
        {mode === 'club' && access?.activeSanction && (
          <div className="mt-4"><ActiveSanctionBanner sanction={access.activeSanction} /></div>
        )}

        {!user && (
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 sm:flex-row sm:items-center">
            <p className="text-sm text-bone-200">
              <span className="font-bold text-emerald-400">Connecte-toi</span> pour publier, commenter et discuter avec les supporters.
            </p>
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-xs font-black uppercase tracking-wider text-ink-900 hover:bg-emerald-300 transition"
            >
              <LogIn size={14} /> Se connecter
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2">
          <StreamingModeCard
            active={mode === 'club'}
            icon={<Video size={22} />}
            title="Streaming Fan Club"
            badge="Public"
            description="Regarde le live officiel avec tous les supporters du club."
            meta={feedLoading ? 'Chargement...' : `${new Intl.NumberFormat('fr-FR').format(counters.supportersCount)} supporters`}
            color="emerald"
            onClick={() => setMode('club')}
          />
          <StreamingModeCard
            active={mode === 'friends'}
            icon={<Users size={22} />}
            title="Mon Streaming"
            badge="Privé"
            description="Regarde le même live, mais discute seulement avec tes amis."
            meta="Salon privé"
            color="sky"
            onClick={() => setMode('friends')}
          />
        </div>
        <LiveMatchBanner
          mode={mode}
          match={liveMatch}
          counters={counters}
        />
        <LiveQuickActions
          mode={mode}
          club={club}
          onReact={handleLiveReaction}
          fanPoints={fanPoints}
        />

        {/* Streaming à GAUCHE + chat à DROITE dès `lg` (1024 px). Avant, le
            côte-à-côte n'arrivait qu'à `xl` (1280 px) : sur un écran un peu
            moins large, le chat basculait sous la vidéo. */}
        <div className="mt-6 grid gap-5 md:mt-8 lg:h-[68vh] lg:min-h-[440px] lg:max-h-[680px] lg:[grid-template-rows:1fr] lg:grid-cols-[minmax(0,1.5fr)_400px] xl:grid-cols-[minmax(0,1.5fr)_420px]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40 lg:flex lg:flex-col lg:h-full">
            <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-bone-100">
                  Live officiel
                </h2>
                <p className="mt-1 text-xs text-bone-500">
                  {mode === 'club'
                    ? 'Vous regardez avec tous les supporters.'
                    : 'Vous regardez avec votre salon privé.'}
                </p>
              </div>

              {stream.isLive ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bone-500">
                  Hors ligne
                </span>
              )}
            </div>

            <div className="relative overflow-hidden bg-ink-950 lg:flex-1 lg:min-h-0">
              <StreamPlayer isLive={stream.isLive} provider={stream.provider} id={stream.id} />

              {/* Réactions flottantes par-dessus la vidéo */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {liveReactions.map((reaction, index) => (
                  <span
                    key={reaction.id}
                    className="absolute bottom-6 text-4xl animate-bounce"
                    style={{ left: `${20 + index * 14}%` }}
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <LiveChat
            mode={mode}
            club={club}
            messages={visibleMessages}
            loading={feedLoading}
            error={feedError}
            isEmpty={isChatEmpty}
            onRetry={reloadFeed}
            onSendMessage={handleSendMessage}
            onUpdateMessage={updateMessage}
            onDeleteMessage={deleteMessage}
            access={access}
            currentUserId={user?.id}
            onReport={(m) => setReportTarget(m)}
            onHideUser={hideUser}
            onOpenCharter={() => setCharterOpen(true)}
            onToggleReaction={(messageId, emoji) => { if (ensureCanWrite()) toggleMessageReaction(messageId, emoji); }}
          />
        </div>

          <div className="mt-6">
            <ParticipantsPanel
              mode={mode}
              fans={fans}
              club={club}
              loading={feedLoading}
              error={feedError}
              onRetry={reloadFeed}
            />
          </div>

        <div className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              Communauté
            </p>

            <h2 className="mt-2 break-words font-display text-2xl font-black uppercase text-bone-50 sm:text-3xl">
              Publications des supporters
            </h2>

            <p className="mt-2 text-sm text-bone-400">
              Continue les discussions, partage tes réactions et échange avec les fans même hors live.
            </p>
          </div>

          <ClubFanCommunity
            club={club}
            fans={fans}
            posts={posts}
            comments={comments}
            newPost={newPost}
            setNewPost={setNewPost}
            onPublish={handlePublish}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={user?.id}
            onReport={(m) => setReportTarget(m)}
            onHideUser={hideUser}
            loading={feedLoading}
            error={feedError}
            isEmpty={feedIsEmpty}
            onRetry={reloadFeed}
            mode={mode}
          />
        </div>
      </Container>

      {/* ── Modération : charte d'entrée + signalement ────────── */}
      <AnimatePresence>
        {charterOpen && access && (
          <CharterEntryModal
            access={access}
            busy={charterBusy}
            onAccept={acceptCharter}
            onClose={() => { setCharterOpen(false); setCharterDismissed(true); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reportTarget && (
          <ReportMessageModal
            message={reportTarget}
            onSubmit={submitReport}
            onClose={() => setReportTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Publication refusée par l'IA avant diffusion (lot 6) */}
      <AnimatePresence>
        {blocked && (
          <BlockedMessageModal
            moderation={blocked.moderation}
            draft={blocked.draft}
            onRewrite={() => { setNewPost(blocked.draft || ''); setBlocked(null); }}
            onClose={() => setBlocked(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function StreamingModeCard({
  active,
  icon,
  title,
  badge,
  description,
  meta,
  color,
  onClick
}) {
  const activeClasses =
    color === 'emerald'
      ? 'border-emerald-400 bg-emerald-400/10'
      : 'border-sky-400 bg-sky-400/10';

  const iconClasses =
    color === 'emerald'
      ? 'text-emerald-400 bg-emerald-400/15'
      : 'text-sky-400 bg-sky-400/15';

  return (
    <button
      onClick={onClick}
      className={`group relative min-h-[160px] overflow-hidden rounded-3xl border p-5 text-left transition-all hover:-translate-y-1 sm:p-6 ${
        active
          ? activeClasses
          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <div className="relative flex items-start justify-between gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconClasses}`}>
          {icon}
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-bone-300">
          {badge}
        </span>
      </div>

      <h2 className="relative mt-5 text-xl font-black text-bone-50">
        {title}
      </h2>

      <p className="relative mt-2 text-sm leading-relaxed text-bone-400">
        {description}
      </p>

      <div className="relative mt-5 text-xs font-bold uppercase tracking-[0.18em] text-bone-500">
        {meta}
      </div>
    </button>
  );
}