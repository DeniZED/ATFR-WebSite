import { config } from './config.js';
import { warn, error as logError } from './logger.js';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  retries?: number;
  timeoutMs?: number;
}

/**
 * Appelle une fonction Netlify protégée par le secret partagé.
 * Retourne `null` en cas d'échec définitif (déjà loggé) plutôt que de lever,
 * pour ne jamais faire planter le bot sur une panne réseau ponctuelle.
 */
export async function callSite<T>(url: string, options: RequestOptions = {}): Promise<T | null> {
  const { method = 'POST', body, retries = 3, timeoutMs = 15_000 } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await sleep(500 * 2 ** (attempt - 1));
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'content-type': 'application/json',
          'x-sync-secret': config.site.syncSecret,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) {
        if (res.status === 204) return null;
        return (await res.json().catch(() => null)) as T | null;
      }
      const text = await res.text().catch(() => '');
      warn(`${method} ${url} → ${res.status}${text ? `: ${text}` : ''}`);
      if (res.status < 500) return null; // 4xx — no retry
    } catch (err) {
      if (attempt === retries - 1) logError(`${method} ${url} failed after retries:`, err);
    }
  }
  return null;
}
