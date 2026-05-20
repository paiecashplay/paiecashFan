-- Shared challenge sessions
CREATE TABLE IF NOT EXISTS challenge_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES game_challenges(id) ON DELETE CASCADE,
  challenger_id text NOT NULL,
  challenged_id text NOT NULL,
  game_id text NOT NULL,
  game_name text NOT NULL,
  status text DEFAULT 'waiting',
  -- status: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'cancelled'
  challenger_ready boolean DEFAULT false,
  challenged_ready boolean DEFAULT false,
  challenger_score integer DEFAULT 0,
  challenged_score integer DEFAULT 0,
  winner_id text DEFAULT null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Real-time score updates during game
CREATE TABLE IF NOT EXISTS challenge_score_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES challenge_sessions(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  score integer NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Note: We wrap the alter publication in an anonymous block to ignore 'already exists' errors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenge_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE challenge_sessions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'challenge_score_updates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE challenge_score_updates;
  END IF;
END $$;
