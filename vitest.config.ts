import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    // Provide a dummy signing secret so _player-token module initialises
    // without throwing, and dummy Supabase/WG variables so modules that
    // transitively import the Supabase client (e.g. features/*/queries.ts)
    // can be collected. These values are never used outside tests — no
    // network call is made by the unit suites.
    env: {
      PLAYER_TOKEN_SECRET: 'vitest-test-secret-not-used-in-production-x',
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'vitest-anon-key-not-used',
      VITE_WOT_APPLICATION_ID: 'vitest-wot-app-id',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
