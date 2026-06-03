/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { getPlayerClan } from '@/lib/wot-api';
import { env } from '@/lib/env';

type Status = 'unknown' | 'loading' | 'member' | 'guest';

// v:3 — comparaison par clan_id (plus robuste que le tag textuel)
interface CacheEntry { isMember: boolean; clanTag: string | null; ts: number; v: 3 }

const CACHE_KEY = 'atfr.player.clan_membership';
const CACHE_TTL = 24 * 60 * 60 * 1000;

function readCache(accountId: number): CacheEntry | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}.${accountId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<CacheEntry>;
    if (entry.v !== 3) {
      localStorage.removeItem(`${CACHE_KEY}.${accountId}`);
      return null;
    }
    if (Date.now() - (entry.ts ?? 0) > CACHE_TTL) return null;
    return entry as CacheEntry;
  } catch {
    return null;
  }
}

function writeCache(accountId: number, isMember: boolean, clanTag: string | null) {
  localStorage.setItem(
    `${CACHE_KEY}.${accountId}`,
    JSON.stringify({ isMember, clanTag, ts: Date.now(), v: 3 } satisfies CacheEntry),
  );
}

interface ClanMembershipValue {
  status: Status;
  isMember: boolean;
  isLoading: boolean;
  isKnown: boolean;
  clanTag: string | null;
}

const ClanMembershipContext = createContext<ClanMembershipValue>({
  status: 'unknown',
  isMember: false,
  isLoading: false,
  isKnown: false,
  clanTag: null,
});

export function ClanMembershipProvider({ children }: { children: ReactNode }) {
  const identity = usePlayerIdentity();
  const [status, setStatus] = useState<Status>('unknown');
  const [clanTag, setClanTag] = useState<string | null>(null);

  useEffect(() => {
    if (!identity.isVerified || !identity.accountId) {
      setStatus('unknown');
      setClanTag(null);
      return;
    }

    const cached = readCache(identity.accountId);
    if (cached !== null) {
      setStatus(cached.isMember ? 'member' : 'guest');
      setClanTag(cached.clanTag);
      return;
    }

    setStatus('loading');
    getPlayerClan(identity.accountId)
      .then((clan) => {
        const tag = clan?.tag ?? null;
        const isMember = !!clan && String(clan.clan_id) === String(env.clanId);
        writeCache(identity.accountId!, isMember, tag);
        setStatus(isMember ? 'member' : 'guest');
        setClanTag(tag);
      })
      .catch(() => {
        setStatus('guest');
        setClanTag(null);
      });
  }, [identity.isVerified, identity.accountId]);

  return (
    <ClanMembershipContext.Provider value={{
      status,
      isMember: status === 'member',
      isLoading: status === 'loading',
      isKnown: status === 'member' || status === 'guest',
      clanTag,
    }}>
      {children}
    </ClanMembershipContext.Provider>
  );
}

export function useClanMembership(): ClanMembershipValue {
  return useContext(ClanMembershipContext);
}
