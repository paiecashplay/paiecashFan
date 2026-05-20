-- ═══════════════════════════════════════════════════════════════
-- 020_social_posts.sql - Social Posts, Likes & Comments
-- ═══════════════════════════════════════════════════════════════

-- ─── Posts Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,
  content     text NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  image_url   text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── Post Likes Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ─── Post Comments Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id     text NOT NULL,
  content     text NOT NULL CHECK (length(content) > 0 AND length(content) <= 1000),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- ─── Auto-update updated_at Trigger for Posts ─────────────────
CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_posts_updated_at();

-- ─── Auto-update updated_at Trigger for Comments ─────────────
CREATE OR REPLACE FUNCTION update_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_updated_at
  BEFORE UPDATE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_updated_at();

-- ─── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Posts: everyone can read, owner can insert/update/delete
CREATE POLICY "Select all posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Insert own posts"
  ON posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Update own posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Delete own posts"
  ON posts FOR DELETE
  USING (true);

-- Post Likes: everyone can read, users can insert/delete own
CREATE POLICY "Select all post likes"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Insert own post likes"
  ON post_likes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Delete own post likes"
  ON post_likes FOR DELETE
  USING (true);

-- Post Comments: everyone can read, users can insert/update/delete own
CREATE POLICY "Select all post comments"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Insert own post comments"
  ON post_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Update own post comments"
  ON post_comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Delete own post comments"
  ON post_comments FOR DELETE
  USING (true);

-- ─── Create Storage Bucket for Post Images ────────────────────
-- Note: Storage bucket creation is handled via Supabase client
-- in the migration runner script, not via SQL.
