function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value || value.length === 0) {
    const msg = `[env] Missing required variable ${key}.`;
    if (import.meta.env.PROD) {
      throw new Error(msg);
    }
    console.warn(msg, 'Check your .env file.');
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
