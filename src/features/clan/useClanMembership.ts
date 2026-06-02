import { useEffect, useState } from 'react';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { getPlayerClan } from '@/lib/wot-api';
import { env } from '@/lib/env';

type Status = 'unknown' | 'loading' | 'member' | 'guest';

// v:2 — entrées sans version (ancien format sans clanTag) sont invalidées
interface CacheEntry { isMember: boolean; clanTag: string | null; ts: number; v: 2 }

const CACHE_KEY = 'atfr.player.clan_membership';
const CACHE_TTL = 24 * 60 * 60 * 1000;

function readCache(accountId: number): CacheEntry | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}.${accountId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Partial<CacheEntry>;
    // Invalide les entrées de l'ancien format (sans v:2 → sans clanTag)
    if (entry.v !== 2) {
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
    JSON.stringify({ isMember, clanTag, ts: Date.now(), v: 2 } satisfies CacheEntry),
  );
}

export function useClanMembership() {
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
        const isMember = !!tag && tag.toUpperCase() === env.clanTag?.toUpperCase();
        writeCache(identity.accountId!, isMember, tag);
        setStatus(isMember ? 'member' : 'guest');
        setClanTag(tag);
      })
      .catch((err: unknown) => {
        console.error('[useClanMembership] getPlayerClan failed:', err);
        setStatus('guest');
        setClanTag(null);
      });
  }, [identity.isVerified, identity.accountId]);

  return {
    status,
    isMember: status === 'member',
    isLoading: status === 'loading',
    isKnown: status === 'member' || status === 'guest',
    clanTag,
  };
}
