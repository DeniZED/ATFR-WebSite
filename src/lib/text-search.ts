// Recherche client partagée des listes admin : insensible à la casse et aux
// accents (« évènement » matche « evenement »).

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** true si la requête (vide = tout) apparaît dans au moins un des champs. */
export function matchesSearch(
  query: string,
  ...fields: Array<string | null | undefined>
): boolean {
  const q = normalizeSearchText(query.trim());
  if (!q) return true;
  return fields.some((field) => field != null && normalizeSearchText(field).includes(q));
}
