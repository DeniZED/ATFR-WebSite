/**
 * Maps known Supabase/PostgREST error messages to French copy. Falls back to
 * a generic message rather than surfacing raw English/technical errors to
 * end users.
 */
const KNOWN_PATTERNS: Array<{ test: RegExp; message: string }> = [
  { test: /invalid login credentials/i, message: 'Email ou mot de passe incorrect.' },
  { test: /email not confirmed/i, message: "Email non confirmé. Vérifiez votre boîte de réception." },
  { test: /user not found/i, message: 'Aucun compte ne correspond à ces identifiants.' },
  { test: /too many requests|rate limit/i, message: 'Trop de tentatives. Réessayez dans quelques minutes.' },
  { test: /duplicate key|already exists|unique constraint/i, message: 'Une candidature a déjà été envoyée avec ces informations.' },
  { test: /failed to fetch|network/i, message: 'Connexion impossible. Vérifiez votre réseau et réessayez.' },
  { test: /jwt|expired|not authenticated|permission denied|row-level security/i, message: 'Session expirée ou accès refusé. Reconnectez-vous puis réessayez.' },
];

export function translateSupabaseError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : '';
  const match = KNOWN_PATTERNS.find((p) => p.test.test(raw));
  return match?.message ?? fallback;
}
