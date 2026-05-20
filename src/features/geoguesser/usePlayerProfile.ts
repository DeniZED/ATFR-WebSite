import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PlayerIdentity } from '@/features/identity/usePlayerIdentity';
import type { LeaderboardEntry } from '@/features/leaderboard/queries';
import {
  DEFAULT_AVATAR_CONFIG,
  levelFromXp,
  totalXpFromScores,
  type AvatarConfig,
  type LevelInfo,
} from './playerProfile';

const AVATAR_CONFIG_KEY = 'atfr.geoguesser.avatar.v1';
const PROFILE_ENDPOINT = '/.netlify/functions/player-profile';

function migrateConfig(raw: Partial<AvatarConfig> & { skinId?: string }): AvatarConfig {
  const base: AvatarConfig = { ...DEFAULT_AVATAR_CONFIG, ...raw };
  // Migration skinId → primaryColorId
  if (!raw.primaryColorId && raw.skinId) {
    const map: Record<string, string> = {
      default: 'col-olive', desert: 'col-desert', winter: 'col-storm',
      urban: 'col-steel', forest: 'col-forest', digital: 'col-teal',
      arctic: 'col-iron', atfr: 'col-atfr', chrome: 'col-chrome',
      prestige: 'col-prestige',
    };
    base.primaryColorId = map[raw.skinId] ?? 'col-olive';
  }
  return base;
}

function loadAvatarConfig(): AvatarConfig {
  try {
    const raw = localStorage.getItem(AVATAR_CONFIG_KEY);
    if (raw) return migrateConfig(JSON.parse(raw) as Partial<AvatarConfig> & { skinId?: string });
  } catch { /* ignore */ }
  return { ...DEFAULT_AVATAR_CONFIG };
}

function saveAvatarConfig(config: AvatarConfig) {
  try {
    localStorage.setItem(AVATAR_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

async function fetchRemoteConfig(accountId: number): Promise<AvatarConfig | null> {
  try {
    const res = await fetch(`${PROFILE_ENDPOINT}?account_id=${accountId}`);
    if (!res.ok) return null;
    const data = await res.json() as { avatar_config?: AvatarConfig };
    return data.avatar_config ?? null;
  } catch {
    return null;
  }
}

async function pushRemoteConfig(
  playerToken: string,
  config: AvatarConfig,
  nickname?: string,
): Promise<void> {
  try {
    await fetch(PROFILE_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        player_token: playerToken,
        avatar_config: config,
        ...(nickname ? { nickname } : {}),
      }),
    });
  } catch { /* best-effort */ }
}

export interface PlayerProfileState {
  avatarConfig: AvatarConfig;
  levelInfo: LevelInfo;
  isLoadingRemote: boolean;
  updateAvatarConfig: (config: AvatarConfig) => void;
}

export function usePlayerProfile(
  identity: PlayerIdentity,
  scores: LeaderboardEntry[] | undefined,
): PlayerProfileState {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => loadAvatarConfig());
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  // Compute XP and level from game history (derived — never stored on client).
  const levelInfo: LevelInfo = useMemo(() => {
    const xp = totalXpFromScores(scores ?? []);
    return levelFromXp(xp);
  }, [scores]);

  // Fetch avatar config from server for verified players on mount / identity change.
  useEffect(() => {
    if (!identity.isVerified || !identity.accountId) return;
    setIsLoadingRemote(true);
    fetchRemoteConfig(identity.accountId).then((remote) => {
      if (remote) {
        const merged = { ...DEFAULT_AVATAR_CONFIG, ...remote };
        setAvatarConfig(merged);
        saveAvatarConfig(merged);
      }
      setIsLoadingRemote(false);
    });
  }, [identity.isVerified, identity.accountId]);

  const updateAvatarConfig = useCallback(
    (config: AvatarConfig) => {
      setAvatarConfig(config);
      saveAvatarConfig(config);
      // Sync to server for verified players; include nickname so it's stored server-side.
      if (identity.isVerified && identity.playerToken) {
        pushRemoteConfig(identity.playerToken, config, identity.nickname ?? undefined);
      }
    },
    [identity.isVerified, identity.playerToken, identity.nickname],
  );

  return { avatarConfig, levelInfo, isLoadingRemote, updateAvatarConfig };
}
