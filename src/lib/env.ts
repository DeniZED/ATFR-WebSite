function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value || value.length === 0) {
    // Don't throw at import time in dev so the site still boots if a single
    // variable is missing — surface a clear warning in the console instead.
    console.warn(`[env] Missing ${key}. Check your .env file.`);
    return '';
  }
  return value;
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
  wotApplicationId: required('VITE_WOT_APPLICATION_ID'),
  clanId: import.meta.env.VITE_CLAN_ID || '500191501',
  clanTag: import.meta.env.VITE_CLAN_TAG || 'ATFR',
  siteUrl: import.meta.env.VITE_SITE_URL || 'https://atfr-clan.netlify.app',
};
