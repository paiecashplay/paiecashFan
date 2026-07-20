import { motion } from 'framer-motion';
import { Heart, MessageCircle, Send, Check, X } from 'lucide-react';
import { onlineCount } from '@/data/clubMocks';
import { useState } from 'react';
import { MessageReportMenu } from '@/components/fanclub/MessageReportMenu';

export function ClubFanCommunity({
  club,
  fans = [],
  posts = [],
  comments = [],
  newPost,
  setNewPost,
  onPublish,
  onUpdatePost,
  onDeletePost,
  onLikePost,
  onAddComment,
  onUpdateComment,
  onDeleteComment,

  // Modération du fil : mêmes règles que le chat (on ne se signale pas soi-même).
  currentUserId = null,
  onReport,
  onHideUser,

  loading = false,
  error = null,
  isEmpty = false,
  onRetry,

  mode = 'club'
}) {
  const getAuthor = (authorId) => fans.find((fan) => fan.id === authorId);
  const [openedPostId, setOpenedPostId] = useState(null);
  const [visibleComments, setVisibleComments] = useState({});

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostContent, setEditingPostContent] = useState('');

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  function startEditingPost(post) {
    if (!post) return;

    setEditingPostId(post.id);
    setEditingPostContent(post.content || '');

    setEditingCommentId(null);
    setEditingCommentContent('');
  }

  function cancelEditingPost() {
    setEditingPostId(null);
    setEditingPostContent('');
  }

  function saveEditingPost() {
    const cleanContent = editingPostContent.trim();

    if (!editingPostId || !cleanContent) {
      return;
    }

    const updated = onUpdatePost?.(
      editingPostId,
      cleanContent
    );

    if (updated !== false) {
      cancelEditingPost();
    }
  }

  function handleDeletePost(post) {
    if (!post?.id) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer cette publication et ses commentaires ?'
    );

    if (!confirmed) return;

    onDeletePost?.(post.id);
  }

  function startEditingComment(comment) {
    if (!comment) return;

    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content || '');

    setEditingPostId(null);
    setEditingPostContent('');
  }

  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditingCommentContent('');
  }

  function saveEditingComment() {
    const cleanContent = editingCommentContent.trim();

    if (!editingCommentId || !cleanContent) {
      return;
    }

    const updated = onUpdateComment?.(
      editingCommentId,
      cleanContent
    );

    if (updated !== false) {
      cancelEditingComment();
    }
  }

  function handleDeleteComment(comment) {
    if (!comment?.id) return;

    const confirmed = window.confirm(
      'Voulez-vous vraiment supprimer ce commentaire ?'
    );

    if (!confirmed) return;

    onDeleteComment?.(comment.id);
  }

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
            <h6 className="flex items-center gap-2 text-xl font-black text-bone-50">
              <MessageCircle
                size={50}
                style={{ color: club.primaryColor }}
              />
              {mode === 'club'
                ? 'Partage tes réactions avec tous les supporters du club'
                : 'Partage tes réactions avec tes amis'}
            </h6>
          </div>
        </div>

        <div className="mt-6">
          <FansStorySection
            fans={fans}
            club={club}
            mode={mode}
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

        {/* ---------- Etat de chargement ---------- */}
        {loading && (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10" />

                  <div className="flex-1">
                    <div className="h-3 w-32 rounded bg-white/10" />
                    <div className="mt-2 h-2 w-20 rounded bg-white/5" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-3 rounded bg-white/10" />
                  <div className="h-3 w-4/5 rounded bg-white/10" />
                  <div className="h-3 w-2/3 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </>
          )
        }

        {/* ---------- Etat d'erreur ---------- */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <h3 className="text-lg font-bold text-red-400">
              Impossible de charger les publications
            </h3>

            <p className="mt-2 text-sm text-bone-400">
              {error}
            </p>

            <button
              onClick={onRetry}
              className="mt-5 rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-400"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && posts.map((post, index) => {

          const author = getAuthor(post.authorId);
          const postComments = comments.filter((comment) => comment.postId === post.id);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="group rounded-2xl border border-white/10 bg-ink-900/60 p-4"
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

                {/* Signalement d'un post — même garde que le chat */}
                <MessageReportMenu
                  message={{ id: post.id, content: post.content, authorId: post.authorId }}
                  isOwn={post.authorId === currentUserId}
                  canReport={!!currentUserId && post.authorId !== currentUserId}
                  onReport={(m) => onReport?.({ ...m, contentType: 'post' })}
                  onHideUser={onHideUser}
                  onBlockUser={onHideUser}
                  onEdit={() => startEditingPost(post)}
                  onDelete={() => handleDeletePost(post)}
                />
              </div>

              {editingPostId === post.id ? (
                  <div className="mt-4">
                    <textarea
                      value={editingPostContent}
                      onChange={(event) =>
                        setEditingPostContent(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') {
                          cancelEditingPost();
                        }

                        if (
                          event.key === 'Enter' &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          saveEditingPost();
                        }
                      }}
                      rows={4}
                      maxLength={500}
                      autoFocus
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-bone-100 outline-none placeholder:text-bone-500 focus:border-white/20"
                    />

                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingPost}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-bone-300 transition hover:bg-white/5"
                      >
                        <X size={14} />
                        Annuler
                      </button>

                      <button
                        type="button"
                        onClick={saveEditingPost}
                        disabled={!editingPostContent.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-black text-ink-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check size={14} />
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-relaxed text-bone-300">
                    {post.content}

                    {post.edited && (
                      <span className="ml-2 text-[10px] italic text-bone-500">
                        modifié
                      </span>
                    )}
                  </p>
                )}
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
                                className="group/com rounded-xl bg-white/[0.04] px-4 py-3"
                                >
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-bone-100">
                                      {commentAuthor?.name || 'Supporter'}
                                  </p>
                                  {/* Signalement d'un commentaire */}
                                  <MessageReportMenu
                                    message={{
                                      id: comment.id,
                                      content: comment.content,
                                      authorId: comment.authorId,
                                    }}
                                    isOwn={
                                      comment.authorId === currentUserId
                                    }
                                    canReport={
                                      !!currentUserId &&
                                      comment.authorId !== currentUserId
                                    }
                                    onReport={(message) =>
                                      onReport?.({
                                        ...message,
                                        contentType: 'comment',
                                      })
                                    }
                                    onHideUser={onHideUser}
                                    onBlockUser={onHideUser}
                                    onEdit={() =>
                                      startEditingComment(comment)
                                    }
                                    onDelete={() =>
                                      handleDeleteComment(comment)
                                    }
                                  />
                                </div>

                                {editingCommentId === comment.id ? (
                                    <div className="mt-2">
                                      <textarea
                                        value={editingCommentContent}
                                        onChange={(event) =>
                                          setEditingCommentContent(
                                            event.target.value
                                          )
                                        }
                                        onKeyDown={(event) => {
                                          if (event.key === 'Escape') {
                                            cancelEditingComment();
                                          }

                                          if (
                                            event.key === 'Enter' &&
                                            !event.shiftKey
                                          ) {
                                            event.preventDefault();
                                            saveEditingComment();
                                          }
                                        }}
                                        rows={3}
                                        maxLength={500}
                                        autoFocus
                                        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-bone-100 outline-none focus:border-white/20"
                                      />

                                      <div className="mt-2 flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={cancelEditingComment}
                                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-bone-300 hover:bg-white/5"
                                        >
                                          <X size={12} />
                                          Annuler
                                        </button>

                                        <button
                                          type="button"
                                          onClick={saveEditingComment}
                                          disabled={
                                            !editingCommentContent.trim()
                                          }
                                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-black text-ink-950 disabled:opacity-50"
                                        >
                                          <Check size={12} />
                                          Enregistrer
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="mt-1 text-sm text-bone-300">
                                      {comment.content}

                                      {comment.edited && (
                                        <span className="ml-2 text-[10px] italic text-bone-500">
                                          modifié
                                        </span>
                                      )}
                                    </p>
                                  )
                                }

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

        {!loading && !error && isEmpty && (
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

export function FansStorySection({ fans, club, mode = 'club' }) {
  const count = onlineCount(fans);
  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-bone-300">
            {mode === 'club' ? 'Supporters connectés' : 'Mes amis'}
        </h2>
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-400 font-bold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          {count} en ligne
        </span>
      </div>

      <div className="overflow-x-auto mask-fade-x -mx-2 px-2">
        <div className="flex gap-3 min-w-max">
          {fans.map((f, i) => (
            <motion.button
              key={f.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center shrink-0 w-16"
            >
              <span
                className="relative h-14 w-14 rounded-full p-0.5 ring-2"
                style={{ borderColor: club.primaryColor, ringColor: `${club.primaryColor}66` }}
              >
                <span className="block h-full w-full rounded-full overflow-hidden bg-ink-700">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <span className="h-full w-full grid place-items-center text-[10px] font-bold text-bone-300">
                      {f.initials || f.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>
                {f.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-900" />
                )}
              </span>
              <span className="mt-1.5 text-[10px] text-bone-400 truncate w-full text-center" title={f.name}>
                {f.name.length > 8 ? f.name.slice(0, 8) + '…' : f.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}