-- Add nickname column to geoguesser_player_profiles so the last known
-- in-game name is persisted server-side alongside the avatar config.
ALTER TABLE geoguesser_player_profiles
  ADD COLUMN IF NOT EXISTS nickname text;
