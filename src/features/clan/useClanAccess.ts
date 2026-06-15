import { useQuery } from '@tanstack/react-query';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { getPlayerClan } from '@/lib/wot-api';
import { useClanPage } from '@/features/clan/pageQueries';

export type ClanAccessStatus =
  | 'loading' // identité / page / clan en cours de résolution
  | 'not-verified' // joueur non connecté via WG
  | 'no-page' // aucune page clan ne correspond au slug
  | 'denied' // joueur vérifié mais clan non autorisé
  | 'granted'; // accès accordé

export interface ClanAccessResult {
  status: ClanAccessStatus;
  /** clan_id WoT du joueur vérifié, si connu. */
  playerClanId: number | null;
  /** tag du clan du joueur, si connu. */
  playerClanTag: string | null;
}

/**
 * Détermine si le joueur WG vérifié courant a accès à la page clan `slug`.
 * Le contrôle compare le clan_id réel du joueur (via l'API WoT) à la liste
 * `allowed_clans` configurée en base pour cette page.
 */
export function useClanAccess(slug: string): ClanAccessResult {
  const identity = usePlayerIdentity();
  const page = useClanPage(slug);

  const clanQuery = useQuery({
    queryKey: ['player_clan', identity.accountId],
    enabled: identity.isVerified && !!identity.accountId,
    queryFn: () => getPlayerClan(identity.accountId!),
    staleTime: 5 * 60_000,
  });

  if (!identity.isVerified) {
    return { status: 'not-verified', playerClanId: null, playerClanTag: null };
  }

  if (page.isLoading || clanQuery.isLoading) {
    return { status: 'loading', playerClanId: null, playerClanTag: null };
  }

  if (!page.data) {
    return { status: 'no-page', playerClanId: null, playerClanTag: null };
  }

  const playerClanId = clanQuery.data?.clan_id ?? null;
  const playerClanTag = clanQuery.data?.tag ?? null;

  const allowed =
    playerClanId != null &&
    page.data.allowed_clans.some(
      (c) => String(c.clan_id) === String(playerClanId),
    );

  return {
    status: allowed ? 'granted' : 'denied',
    playerClanId,
    playerClanTag,
  };
}
