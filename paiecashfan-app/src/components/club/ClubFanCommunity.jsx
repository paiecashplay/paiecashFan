import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { onlineCount } from '@/data/clubMocks';
import { FansStorySection } from '@/pages/ClubDetail';
import { useState } from 'react';

export function ClubFanCommunity({
  club,
  fans = [],
  posts = [],
  comments = [],
  newPost,
  setNewPost,
  onPublish,
  onLikePost,
  onAddComment
}) {
  const getAuthor = (authorId) => fans.find((fan) => fan.id === authorId);
  const [openedPostId, setOpenedPostId] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});

  function toggleComments(postId) {
  if (openedPostId === postId) {
    setOpenedPostId(null);
    return;
  }

  setOpenedPostId(postId);

  setVisibleComments((prev) => ({
    ...prev,
    [postId]: 3
  }));
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden">

      {/* ---------- Header ---------- */}
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-bone-50">
              <MessageCircle
                size={22}
                style={{ color: club.primaryColor }}
              />
              Fans de {club.name}
            </h2>

            <p className="mt-1 text-sm text-bone-400">
              Partage tes réactions avec les supporters du club.
            </p>
          </div>

          <div className="rounded-full bg-emerald-500/15 px-4 py-2">
            <span className="text-xs font-bold text-emerald-400">
              {onlineCount(fans)} en ligne
            </span>
          </div>
        </div>

        <div className="mt-6">
          <FansStorySection
            fans={fans}
            club={club}
          />
        </div>
      </div>

      {/* ---------- Nouvelle publication ---------- */}
      <div className="border-b border-white/10 p-5">
        <div className="flex gap-3">

          <input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onPublish();
              }
            }}
            placeholder={`Exprime-toi sur ${club.name}...`}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none placeholder:text-bone-500 focus:border-white/20"
          />

          <button
            onClick={onPublish}
            className="grid h-11 w-11 place-items-center rounded-xl text-white transition hover:scale-105"
            style={{
              background: club.primaryColor
            }}
          >
            <Send size={18} />
          </button>

        </div>
      </div>

      {/* ---------- Publications ---------- */}
      <div className="space-y-4 p-5">

        {posts.map((post, index) => {

          const author = getAuthor(post.authorId);
          const postComments = comments.filter((comment) => comment.postId === post.id);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-white/10 bg-ink-900/60 p-4"
            >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-white/10">
                    {author?.avatar ? (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-xs font-bold text-bone-300">
                        {author?.initials ||
                          author?.name?.slice(0, 2).toUpperCase() ||
                          'SU'}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-bone-100">
                      {author?.name || 'Supporter'}
                    </p>
                    <p className="text-[11px] text-bone-500">
                      {post.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-bone-300">
                {post.content}
              </p>
                <div className="mt-5 flex items-center gap-6 border-t border-white/10 pt-4">
                    <button
                        onClick={() => onLikePost(post.id)}
                        className="flex items-center gap-2 text-sm text-bone-400 transition hover:text-rose-400"
                    >
                        <Heart size={16} />
                        <span>{post.likes}</span>
                    </button>

                    <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-sm text-bone-400 transition hover:text-sky-400"
                        >
                        <MessageCircle size={16} />

                        <span>
                            {openedPostId === post.id
                            ? "Masquer les commentaires"
                            : `${postComments.length} commentaire${postComments.length > 1 ? "s" : ""}`}
                        </span>
                    </button>
                </div>
                <div className="mt-4 space-y-3">
                    {openedPostId === post.id && (
                        <div className="mt-4 space-y-3">
                            {postComments
                            .slice(0, visibleComments[post.id] || 3)
                            .map((comment) => {
                            const commentAuthor = getAuthor(comment.authorId);

                            return (
                                <div
                                key={comment.id}
                                className="rounded-xl bg-white/[0.04] px-4 py-3"
                                >
                                <p className="text-xs font-bold text-bone-100">
                                    {commentAuthor?.name || 'Supporter'}
                                </p>

                                <p className="mt-1 text-sm text-bone-300">
                                    {comment.content}
                                </p>

                                <p className="mt-1 text-[10px] text-bone-500">
                                    {comment.createdAt}
                                </p>
                                </div>
                            );
                            })}

                            <AddCommentBox
                            postId={post.id}
                            club={club}
                            onAddComment={onAddComment}
                            />

                            {postComments.length > (visibleComments[post.id] || 3) && (
                            <button
                                onClick={() =>
                                setVisibleComments((prev) => ({
                                    ...prev,
                                    [post.id]: prev[post.id] + 3
                                }))
                                }
                                className="text-sm font-semibold text-sky-400 hover:text-sky-300"
                            >
                                Voir plus de commentaires
                            </button>
                            )}
                        </div>
                    )}
                </div>

            </motion.article>

          );

        })}

        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
            <MessageCircle
              size={34}
              className="mx-auto mb-4 text-bone-500"
            />

            <h3 className="text-lg font-bold text-bone-200">
              Aucune publication
            </h3>

            <p className="mt-2 text-sm text-bone-500">
              Soyez le premier supporter à publier dans la communauté de {club.name}.
            </p>
          </div>
        )}

      </div>

    </section>
  );
}

function AddCommentBox({ postId, club, onAddComment }) {
  const [comment, setComment] = useState('');

  function handleSend() {
    if (!comment.trim()) return;
    onAddComment(postId, comment.trim());
    setComment('');
  }

  return (
    <div className="flex gap-2">
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="Écrire un commentaire..."
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-bone-100 outline-none placeholder:text-bone-500"
      />

      <button
        onClick={handleSend}
        className="rounded-xl px-3 text-xs font-bold text-white"
        style={{ background: club.primaryColor }}
      >
        Envoyer
      </button>
    </div>
  );
}