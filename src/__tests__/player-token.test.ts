// process.env.PLAYER_TOKEN_SECRET is injected by vitest.config.ts before this
// module is loaded, so the module-level initialisation does not throw.
import { describe, it, expect } from 'vitest';
import { issuePlayerToken, verifyPlayerToken } from '../../netlify/functions/_player-token';

describe('issuePlayerToken / verifyPlayerToken', () => {
  it('round-trip: issued token is verifiable', () => {
    const token = issuePlayerToken(12345);
    expect(typeof token).toBe('string');
    expect(verifyPlayerToken(token)).toBe(12345);
  });

  it('preserves account_id across multiple tokens', () => {
    expect(verifyPlayerToken(issuePlayerToken(1))).toBe(1);
    expect(verifyPlayerToken(issuePlayerToken(500191501))).toBe(500191501);
  });

  it('rejects a token with a tampered signature', () => {
    const token = issuePlayerToken(99999);
    const dot = token.lastIndexOf('.');
    const tampered = token.slice(0, dot + 1) + 'AAAAAAAAAA';
    expect(verifyPlayerToken(tampered)).toBeNull();
  });

  it('rejects a token with a tampered payload', () => {
    const token = issuePlayerToken(42);
    const dot = token.lastIndexOf('.');
    const fakePayload = Buffer.from(JSON.stringify({ a: 999, e: 9999999999 })).toString('base64url');
    const tampered = `${fakePayload}.${token.slice(dot + 1)}`;
    expect(verifyPlayerToken(tampered)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(verifyPlayerToken('no-dot-at-all')).toBeNull();
    expect(verifyPlayerToken('')).toBeNull();
    expect(verifyPlayerToken(null as unknown as string)).toBeNull();
  });
});
