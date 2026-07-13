import { useState } from 'react';
import { Users } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { ClubFanCommunity } from '@/components/club/ClubFanCommunity';
import { useFanFeed } from '@/hooks/useFanFeed';

// Section "Communauté" intégrée à la page d'un club : le fil des supporters
// (publications + commentaires + likes) persisté par club. Réutilise le hook
// useFanFeed et le composant ClubFanCommunity de la page Fan Club.
export function ClubCommunitySection({ clubSlug, club, primaryColor }) {
  const {
    fans, posts, comments,
    loading, error, isEmpty, reload,
    publishPost, likePost, addComment,
  } = useFanFeed(clubSlug, 'club');

  const [newPost, setNewPost] = useState('');

  return (
    <section id="community" className="py-16 md:py-20 border-t border-white/5 scroll-mt-20">
      <Container>
        <header className="mb-6 flex items-center gap-3">
          <Users size={18} style={{ color: primaryColor }} />
          <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-bone-50">
            Communauté des supporters
          </h2>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${primaryColor}55, transparent)` }} />
        </header>

        <ClubFanCommunity
          club={club}
          fans={fans}
          posts={posts}
          comments={comments}
          newPost={newPost}
          setNewPost={setNewPost}
          onPublish={() => { if (publishPost(newPost)) setNewPost(''); }}
          onLikePost={likePost}
          onAddComment={addComment}
          loading={loading}
          error={error}
          isEmpty={isEmpty}
          onRetry={reload}
          mode="club"
        />
      </Container>
    </section>
  );
}
