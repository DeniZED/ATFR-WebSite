import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  /** Titre de l'onglet/partage — suffixé automatiquement par le nom du site. */
  title: string;
  description?: string;
}

/**
 * Métadonnées par route (P2-8) : jusqu'ici index.html portait un titre et
 * une description identiques pour tout le site. À poser sur les pages
 * publiques à enjeu de partage (recrutement, événements, membres…).
 */
export function PageMeta({ title, description }: PageMetaProps) {
  const fullTitle = `${title} — ATFR`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
}
