/** Message lisible d'une erreur inconnue. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return '';
}

/**
 * Détecte un échec de chargement de module dynamique (chunk lazy périmé),
 * typique juste après un déploiement quand l'ancien hash de fichier n'existe
 * plus. Dans ce cas, un simple rechargement récupère la nouvelle version.
 */
export function isChunkLoadError(error: unknown): boolean {
  const msg = errorMessage(error).toLowerCase();
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('error loading') ||
    msg.includes('chunk')
  );
}
