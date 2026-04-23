export interface ApplicationNotificationPayload {
  playerName: string;
  discordTag: string;
  targetClan: 'ATFR' | 'A-T-O';
  wn8: number | null;
  winRate: number | null;
  battles: number | null;
  availability: string;
  motivation: string;
  previousClans?: string | null;
  accountId?: number | null;
}

export async function notifyNewApplication(
  app: ApplicationNotificationPayload,
): Promise<void> {
  const res = await fetch('/.netlify/functions/discord-notify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(app),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('[discord] webhook failed', res.status, text);
    throw new Error('Discord notification failed');
  }
}
