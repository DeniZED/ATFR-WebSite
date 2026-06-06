import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    // Provide a dummy signing secret so _player-token module initialises
    // without throwing. This value is never used outside tests.
    env: {
      PLAYER_TOKEN_SECRET: 'vitest-test-secret-not-used-in-production-x',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
