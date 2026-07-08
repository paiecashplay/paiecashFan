import { useState } from 'react';
import {  Video, Users, Radio} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { ClubFanCommunity } from '@/components/club/ClubFanCommunity';
import { LiveChat } from '@/components/fanclub/LiveChat';
import { ParticipantsPanel } from '@/components/fanclub/ParticipantsPanel';
import { LiveMatchBanner } from '@/components/fanclub/LiveMatchBanner';
import { LiveQuickActions } from '@/components/fanclub/LiveQuickActions';
import {
  mockFans,
  mockFanPosts,
  mockComments
} from '@/data/clubMocks';

const mockClub = {
  name: 'Paris Saint-Germain',
  slug: 'paris-saint-germain',
  primaryColor: '#004170'
};

export function FanClub() {
  const [mode, setMode] = useState('club');

  const [clubPosts, setClubPosts] = useState(mockFanPosts);
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [fanComments, setFanComments] = useState(mockComments);
  const [newPost, setNewPost] = useState('');

  const activePosts = mode === 'club' ? clubPosts : friendsPosts;
  const setActivePosts = mode === 'club' ? setClubPosts : setFriendsPosts;

  const [liveReactions, setLiveReactions] = useState([]);

  const [fanPoints, setFanPoints] = useState(0);

  function handlePublish() {
    if (!newPost.trim()) return;

    setActivePosts((prev) => [
      {
        id: crypto.randomUUID(),
        clubSlug: mockClub.slug,
        authorId: 'current-user',
        content: newPost.trim(),
        createdAt: 'Maintenant',
        likes: 0,
        comments: 0
      },
      ...prev
    ]);

    setNewPost('');
  }

  function handleLikePost(postId) {
    setActivePosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  }

  function handleAddComment(postId, content) {
    if (!content.trim()) return;

    setFanComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        postId,
        authorId: 'current-user',
        content: content.trim(),
        createdAt: 'Maintenant'
      }
    ]);
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
        <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl opacity-30"
            style={{ background: mockClub.primaryColor }}
          />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-400">
              <Radio size={13} />
              Fan Club Live
            </div>

            <h1 className="mt-5 font-display text-4xl md:text-6xl font-black uppercase text-bone-50">
              {mockClub.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm md:text-base text-bone-400">
              Regarde le live officiel du club, échange avec tous les supporters ou crée ton espace privé avec tes amis.
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <StreamingModeCard
            active={mode === 'club'}
            icon={<Video size={22} />}
            title="Streaming Fan Club"
            badge="Public"
            description="Regarde le live officiel avec tous les supporters du club."
            meta={`${mockFans.length} supporters`}
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
          club={mockClub}
          mode={mode}
        />
        <LiveQuickActions
          mode={mode}
          club={mockClub}
          onReact={handleLiveReaction}
          fanPoints={fanPoints}
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
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

              <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Live
              </span>
            </div>

            <div className="relative grid aspect-video place-items-center overflow-hidden bg-ink-950 text-sm text-bone-500">
              Lecteur vidéo officiel du club

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {liveReactions.map((reaction, index) => (
                <span
                  key={reaction.id}
                  className="absolute bottom-6 text-4xl animate-bounce"
                  style={{
                    left: `${20 + index * 14}%`
                  }}
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          </div>
          </section>

          <LiveChat mode={mode} club={mockClub} />
        </div>

          <div className="mt-6">
            <ParticipantsPanel
              mode={mode}
              fans={mockFans}
              club={mockClub}
            />
          </div>

        <div className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
              Communauté
            </p>

            <h2 className="mt-2 font-display text-3xl font-black uppercase text-bone-50">
              Publications des supporters
            </h2>

            <p className="mt-2 text-sm text-bone-400">
              Continue les discussions, partage tes réactions et échange avec les fans même hors live.
            </p>
          </div>

          <ClubFanCommunity
            club={mockClub}
            fans={mockFans}
            posts={activePosts}
            comments={fanComments}
            newPost={newPost}
            setNewPost={setNewPost}
            onPublish={handlePublish}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            mode={mode}
          />
        </div>
      </Container>
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
      className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all hover:-translate-y-1 ${
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