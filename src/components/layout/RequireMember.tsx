import { Outlet } from 'react-router-dom';
import { useClanMembership } from '@/features/clan/useClanMembership';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { Spinner } from '@/components/ui';

/**
 * Protège les routes réservées aux membres ATFR vérifiés via WG.
 * - Non connecté WG → invite à se connecter
 * - Connecté mais non-membre → accès refusé
 * - Chargement → spinner
 * - Membre confirmé → rendu de la route
 */
export function RequireMember() {
  const identity = usePlayerIdentity();
  const { status } = useClanMembership();

  if (!identity.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atfr-ink">
        <div className="text-center max-w-sm px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">Accès restreint</p>
          <h1 className="font-display text-2xl text-atfr-bone mb-3">Connexion requise</h1>
          <p className="text-sm text-atfr-fog">
            Cette section est réservée aux membres du clan ATFR.
            Connecte ton compte Wargaming via la bulle de profil en haut à droite.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'loading' || status === 'unknown') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atfr-ink">
        <Spinner label="Vérification de l'appartenance au clan…" />
      </div>
    );
  }

  if (status !== 'member') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atfr-ink">
        <div className="text-center max-w-sm px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">Accès refusé</p>
          <h1 className="font-display text-2xl text-atfr-bone mb-3">Membres ATFR uniquement</h1>
          <p className="text-sm text-atfr-fog">
            Tu es bien connecté avec ton compte Wargaming, mais ton compte n'est pas
            membre du clan ATFR.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
