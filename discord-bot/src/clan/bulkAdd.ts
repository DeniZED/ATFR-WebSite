import { resolveClanInput } from './wgClient.js';
import { addTrackedClan, getGuildConfig } from '../guildConfig.js';
import { log, error as logError } from '../logger.js';

export interface BulkAddResult {
  input: string;
  status: 'added' | 'already_tracked' | 'not_found' | 'error';
  clanId?: number;
  clanTag?: string | null;
  clanName?: string | null;
  detail?: string;
}

/** Résout puis ajoute une liste de tags/clan_id à la liste suivie d'un serveur, un par un (rate-limit WG friendly). */
export async function bulkAddTrackedClans(
  guildId: string,
  entries: string[],
  updatedBy: string | null,
): Promise<BulkAddResult[]> {
  const cleaned = [...new Set(entries.map((e) => e.trim()).filter(Boolean))];
  const results: BulkAddResult[] = [];

  for (const input of cleaned) {
    try {
      const cfg = await getGuildConfig(guildId);
      const alreadyTracked = cfg.tracked_clans.some(
        (c) => c.clan_tag?.toLowerCase() === input.toLowerCase() || String(c.clan_id) === input,
      );
      if (alreadyTracked) {
        results.push({ input, status: 'already_tracked' });
        continue;
      }

      const resolved = await resolveClanInput(input);
      if (!resolved) {
        results.push({ input, status: 'not_found' });
        continue;
      }

      await addTrackedClan(guildId, resolved.clanId, resolved.tag, resolved.name, updatedBy);
      results.push({
        input,
        status: 'added',
        clanId: resolved.clanId,
        clanTag: resolved.tag,
        clanName: resolved.name,
      });
      log(`Ajout en masse : clan ${resolved.tag ?? resolved.clanId} ajouté au serveur ${guildId}`);
    } catch (err) {
      logError(`Ajout en masse : échec pour "${input}":`, err);
      results.push({ input, status: 'error', detail: (err as Error).message });
    }
  }

  return results;
}
