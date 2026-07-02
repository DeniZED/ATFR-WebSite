import { useQuery } from '@tanstack/react-query';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import type {
  DoctrineSection,
  LinkEntry,
  MapEntry,
  RoleEntry,
  StrategyEntry,
  TankEntry,
} from './types';

// Contenu réservé du clan-hub (P0-2) : plus jamais compilé dans le bundle
// JS public. Servi par la fonction Netlify clan-content, qui vérifie côté
// serveur le player_token HMAC et l'appartenance du joueur à un clan
// autorisé (clan_pages.allowed_clans) avant de renvoyer quoi que ce soit.
export interface ClanPageContents {
  doctrine?: { intro: string; sections: DoctrineSection[] };
  links?: { links: LinkEntry[] };
  maps?: { maps: MapEntry[] };
  roles?: { roles: RoleEntry[] };
  strategies?: { strategies: StrategyEntry[] };
  tanks?: { tanks: TankEntry[] };
}

export function useClanContent(pageSlug = 'clan-hub') {
  const identity = usePlayerIdentity();
  return useQuery({
    queryKey: ['clan_page_content', pageSlug, identity.accountId ?? 'anon'],
    enabled: identity.isVerified && !!identity.playerToken,
    staleTime: 10 * 60_000,
    queryFn: async (): Promise<ClanPageContents> => {
      const res = await fetch('/.netlify/functions/clan-content', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          page_slug: pageSlug,
          player_token: identity.playerToken,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      const json = (await res.json().catch(() => ({}))) as {
        contents?: ClanPageContents;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      return json.contents ?? {};
    },
  });
}
