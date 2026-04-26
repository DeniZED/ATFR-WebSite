import { useCallback, useEffect, useState } from 'react';
import { env } from '@/lib/env';

const KEYS = {
  id: 'atfr.player.id',
  nickname: 'atfr.player.nickname',
  accountId: 'atfr.player.account_id',
  accessToken: 'atfr.player.access_token',
  expiresAt: 'atfr.player.access_expires',
  verified: 'atfr.player.verified',
} as const;

const RETURN_KEY = 'atfr.player.wg_return';
const WG_LOGIN_URL = 'https://api.worldoftanks.eu/wot/auth/login/';
const WG_LOGOUT_URL = 'https://api.worldoftanks.eu/wot/auth/logout/';

export interface PlayerIdentity {
  /** Stable random uuid persisted in localStorage. Used to track an
   *  anonymous player across sessions. */
  id: string;
  nickname: string;
  accountId: number | null;
  accessToken: string | null;
  expiresAt: number | null;
  isVerified: boolean;
}

function readId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(KEYS.id);
  if (!id) {
    id =
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `anon-${Math.random().toString(36).slice(2)}-${Date.now()}`);
    localStorage.setItem(KEYS.id, id);
  }
  return id;
}

function readIdentity(): PlayerIdentity {
  const id = readId();
  const nickname = localStorage.getItem(KEYS.nickname) ?? '';
  const accountIdRaw = localStorage.getItem(KEYS.accountId);
  const accountId = accountIdRaw ? Number(accountIdRaw) : null;
  const accessToken = localStorage.getItem(KEYS.accessToken);
  const expiresAtRaw = localStorage.getItem(KEYS.expiresAt);
  const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : null;
  const verifiedRaw = localStorage.getItem(KEYS.verified);
  const expired = expiresAt != null && expiresAt * 1000 < Date.now();
  const isVerified = verifiedRaw === 'true' && accountId != null && !expired;
  return { id, nickname, accountId, accessToken, expiresAt, isVerified };
}

export function usePlayerIdentity() {
  const [state, setState] = useState<PlayerIdentity>(() => readIdentity());

  // Sync across tabs.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!e.key) return;
      const watched: string[] = Object.values(KEYS);
      if (watched.includes(e.key)) {
        setState(readIdentity());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setNickname = useCallback((next: string) => {
    const trimmed = next.trim().slice(0, 32);
    if (!trimmed) return;
    localStorage.setItem(KEYS.nickname, trimmed);
    setState((prev) => ({ ...prev, nickname: trimmed }));
  }, []);

  const startWgLogin = useCallback(() => {
    if (!env.wotApplicationId) {
      throw new Error('VITE_WOT_APPLICATION_ID manquant — login WG impossible.');
    }
    sessionStorage.setItem(
      RETURN_KEY,
      window.location.pathname + window.location.search,
    );
    const url = new URL(WG_LOGIN_URL);
    url.searchParams.set('application_id', env.wotApplicationId);
    url.searchParams.set(
      'redirect_uri',
      `${window.location.origin}/auth/wg/callback`,
    );
    url.searchParams.set('display', 'page');
    url.searchParams.set('nofollow', '0');
    window.location.href = url.toString();
  }, []);

  const logoutVerified = useCallback(async () => {
    const token = state.accessToken;
    localStorage.removeItem(KEYS.accountId);
    localStorage.removeItem(KEYS.accessToken);
    localStorage.removeItem(KEYS.expiresAt);
    localStorage.removeItem(KEYS.verified);
    setState((prev) => ({
      ...prev,
      accountId: null,
      accessToken: null,
      expiresAt: null,
      isVerified: false,
    }));
    if (token && env.wotApplicationId) {
      try {
        const body = new URLSearchParams({
          application_id: env.wotApplicationId,
          access_token: token,
        });
        await fetch(WG_LOGOUT_URL, { method: 'POST', body });
      } catch {
        // Best-effort: WG logout is optional.
      }
    }
  }, [state.accessToken]);

  return { ...state, setNickname, startWgLogin, logoutVerified };
}

/**
 * Helpers used by the WG callback page. Outside the hook so they can
 * be called from a non-React module context.
 */
export const PlayerIdentityStorage = {
  saveVerified(args: {
    accountId: number;
    nickname: string;
    accessToken: string;
    expiresAt: number;
  }) {
    localStorage.setItem(KEYS.accountId, String(args.accountId));
    localStorage.setItem(KEYS.nickname, args.nickname);
    localStorage.setItem(KEYS.accessToken, args.accessToken);
    localStorage.setItem(KEYS.expiresAt, String(args.expiresAt));
    localStorage.setItem(KEYS.verified, 'true');
  },
  popReturnUrl(): string {
    const v = sessionStorage.getItem(RETURN_KEY) ?? '/';
    sessionStorage.removeItem(RETURN_KEY);
    return v;
  },
};
