-- Avatar customization for geoguesser players.
-- XP is always computed on-the-fly from module_scores (no storage needed).
-- This table only persists the avatar cosmetic config for verified players.
CREATE TABLE IF NOT EXISTS geoguesser_player_profiles (
  id             uuid     DEFAULT gen_random_uuid() PRIMARY KEY,
  player_account_id bigint UNIQUE NOT NULL,
  avatar_config  jsonb    DEFAULT '{"skinId":"default","accessoryIds":[],"effectId":null,"titleId":null}'::jsonb NOT NULL,
  created_at     timestamptz DEFAULT now() NOT NULL,
  updated_at     timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE geoguesser_player_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for future leaderboard avatar display).
CREATE POLICY "Public read geoguesser_player_profiles"
  ON geoguesser_player_profiles
  FOR SELECT
  USING (true);

-- Writes only via service role (Netlify player-profile function).
-- No additional INSERT/UPDATE policies → anon key can only read.

-- Trigger to keep updated_at current.
CREATE OR REPLACE FUNCTION update_geoguesser_player_profile_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_geoguesser_player_profile_updated
  BEFORE UPDATE ON geoguesser_player_profiles
  FOR EACH ROW EXECUTE FUNCTION update_geoguesser_player_profile_timestamp();
