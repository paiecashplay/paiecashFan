-- Create chat profiles table
CREATE TABLE chat_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  username text NOT NULL,
  avatar_url text,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create friend requests table
CREATE TABLE friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id text NOT NULL,
  receiver_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create chat messages table
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  sender_id text NOT NULL,
  receiver_id text NOT NULL,
  content text NOT NULL CHECK (length(content) > 0 AND length(content) <= 2000),
  is_read boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_messages_receiver_read ON chat_messages(receiver_id, is_read) WHERE is_read = false;
CREATE INDEX idx_friend_requests_receiver_status ON friend_requests(receiver_id, status);
CREATE INDEX idx_friend_requests_sender_status ON friend_requests(sender_id, status);

-- Trigger to auto-update friend_requests.updated_at
CREATE OR REPLACE FUNCTION update_friend_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_friend_requests_updated_at
  BEFORE UPDATE ON friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_friend_requests_updated_at();

-- Trigger to auto-update chat_profiles.last_seen
CREATE OR REPLACE FUNCTION update_chat_profiles_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_online != OLD.is_online THEN
    NEW.last_seen = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_profiles_last_seen
  BEFORE UPDATE ON chat_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_profiles_last_seen();

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE friend_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Enable Row Level Security
ALTER TABLE chat_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_profiles
CREATE POLICY "Select all chat profiles"
  ON chat_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert own chat profile"
  ON chat_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Update own chat profile"
  ON chat_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- RLS Policies for friend_requests
CREATE POLICY "Select own friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

CREATE POLICY "Insert own friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid()::text);

CREATE POLICY "Update own friend requests"
  ON friend_requests FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text)
  WITH CHECK (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

-- RLS Policies for chat_messages
CREATE POLICY "Select own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid()::text OR receiver_id = auth.uid()::text);

CREATE POLICY "Insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid()::text AND conversation_id LIKE '%' || auth.uid()::text || '%');
