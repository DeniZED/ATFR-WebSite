interface VoiceSession {
  userId: string;
  username: string;
  channelName: string;
  joinedAt: number;
}

const MAX_LOG_LINES = 300;
const logBuffer: string[] = [];
const activeVoice = new Map<string, VoiceSession>();

export function pushLog(line: string): void {
  logBuffer.push(line);
  if (logBuffer.length > MAX_LOG_LINES) logBuffer.shift();
}

export function getLogs(): string[] {
  return logBuffer;
}

export function voiceJoin(userId: string, username: string, channelName: string): void {
  activeVoice.set(userId, { userId, username, channelName, joinedAt: Date.now() });
}

export function voiceMove(userId: string, channelName: string): void {
  const session = activeVoice.get(userId);
  if (session) session.channelName = channelName;
  else activeVoice.set(userId, { userId, username: userId, channelName, joinedAt: Date.now() });
}

export function voiceLeave(userId: string): void {
  activeVoice.delete(userId);
}

export function getActiveVoiceSessions(): VoiceSession[] {
  return [...activeVoice.values()];
}
