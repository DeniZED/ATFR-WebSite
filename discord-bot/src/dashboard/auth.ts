import { createHash, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { config } from '../config.js';

function safeEqual(a: string, b: string): boolean {
  const h = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

/** Authentification HTTP Basic optionnelle (active uniquement si les deux variables sont définies). */
export function isAuthorized(req: IncomingMessage): boolean {
  const { dashboardUsername, dashboardPassword } = config.behaviour;
  if (!dashboardUsername || !dashboardPassword) return true;

  const header = req.headers.authorization;
  if (!header?.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    if (sep === -1) return false;
    const user = decoded.slice(0, sep);
    const pass = decoded.slice(sep + 1);
    return safeEqual(user, dashboardUsername) && safeEqual(pass, dashboardPassword);
  } catch {
    return false;
  }
}

export function sendUnauthorized(res: ServerResponse): void {
  res.writeHead(401, {
    'content-type': 'text/plain',
    'www-authenticate': 'Basic realm="ATFR Discord Bot Dashboard"',
  });
  res.end('Unauthorized');
}
