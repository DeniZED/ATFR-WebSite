import { Outlet } from 'react-router-dom';
import { useClanAccess } from '@/features/clan/useClanAccess';
import { Spinner } from '@/components/ui';

/**
 * Protège une route clan dont l'accès est configuré dynamiquement en base
 * (table `clan_pages`). Le joueur doit être connecté via Wargaming ET
 * appartenir à l'un des clans autorisés pour la page `slug`.
 */
export function RequireClanAccess({ slug }: { slug: string }) {
  const { status, playerClanTag } = useClanAccess(slug);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atfr-ink">
        <Spinner label="Vérification de l'accès…" />
      </div>
    );
  }

  if (status === 'not-verified') {
    return (
      <Gate
        eyebrow="Accès restreint"
        title="Connexion requise"
        message="Cette section est réservée aux membres du clan. Connecte ton compte Wargaming via la bulle de profil en haut à droite."
      />
    );
  }

  if (status === 'no-page') {
    return (
      <Gate
        eyebrow="Indisponible"
        title="Page introuvable"
        message="Cette page clan n'est pas configurée. Contacte un administrateur."
      />
    );
  }

  if (status === 'denied') {
    return (
      <Gate
        eyebrow="Accès refusé"
        title="Clan non autorisé"
        message={
          playerClanTag
            ? `Ton compte appartient au clan [${playerClanTag}], qui n'a pas accès à cette section.`
            : "Ton compte n'appartient à aucun clan autorisé pour cette section."
        }
      />
    );
  }

  return <Outlet />;
}

function Gate({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-atfr-ink">
      <div className="text-center max-w-sm px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl text-atfr-bone mb-3">{title}</h1>
        <p className="text-sm text-atfr-fog">{message}</p>
      </div>
    </div>
  );
}
