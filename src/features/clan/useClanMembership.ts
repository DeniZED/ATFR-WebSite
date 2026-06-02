import { useEffect, useState } from 'react';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { getPlayerClan } from '@/lib/wot-api';
import { env } from '@/lib/env';

type Status = 'unknown' | 'loading' | 'member' | 'guest';

const CACHE_KEY = 'atfr.player.clan_membership';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function readCache(accountId: number): boolean | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}.${accountId}`);
    if (!raw) return null;
    const { isMember, ts } = JSON.parse(raw) as { isMember: boolean; ts: number };
    if (Date.now() - ts > CACHE_TTL) return null;
    return isMember;
  } catch {
    return null;
  }
}

function writeCache(accountId: number, isMember: boolean) {
  localStorage.setItem(
    `${CACHE_KEY}.${accountId}`,
    JSON.stringify({ isMember, ts: Date.now() }),
  );
}

export function useClanMembership() {
  const identity = usePlayerIdentity();
  const [status, setStatus] = useState<Status>('unknown');

  useEffect(() => {
    if (!identity.isVerified || !identity.accountId) {
      setStatus('unknown');
      return;
    }

    const cached = readCache(identity.accountId);
    if (cached !== null) {
      setStatus(cached ? 'member' : 'guest');
      return;
    }

    setStatus('loading');
    getPlayerClan(identity.accountId)
      .then((clan) => {
        const isMember =
          !!clan?.tag && clan.tag.toUpperCase() === env.clanTag?.toUpperCase();
        writeCache(identity.accountId!, isMember);
        setStatus(isMember ? 'member' : 'guest');
      })
      .catch(() => setStatus('guest'));
  }, [identity.isVerified, identity.accountId]);

  return {
    status,
    isMember: status === 'member',
    isLoading: status === 'loading',
    isKnown: status === 'member' || status === 'guest',
  };
}
