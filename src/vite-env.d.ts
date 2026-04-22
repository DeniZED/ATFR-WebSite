/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_WOT_APPLICATION_ID: string;
  readonly VITE_CLAN_ID: string;
  readonly VITE_CLAN_TAG: string;
  readonly VITE_DISCORD_WEBHOOK_URL: string;
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
