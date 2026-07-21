import { Link, Navigate, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft, Hourglass } from 'lucide-react';
import { Button, Card, CardBody, Section, Spinner } from '@/components/ui';
import { usePublishedModules } from '@/features/modules/queries';
import { normalizeModuleStatus } from '@/features/modules/registry';

/**
 * Protège la route d'un module de l'académie.
 *
 * - Module non publié (ou slug inconnu) → inaccessible : retour au hub.
 * - Module publié mais au statut « bientôt » → visible sur le hub mais
 *   PAS jouable : on affiche un écran « bientôt disponible » au lieu du
 *   composant du jeu.
 * - Sinon → la route s'affiche normalement.
 *
 * Le `slug` peut être fixe (routes dédiées guide-bots / wot-geoguesser) ou
 * résolu depuis l'URL (`/modules/:slug`).
 */
export function RequireModulePlayable({ slug: slugProp }: { slug?: string }) {
  const params = useParams<{ slug: string }>();
  const slug = slugProp ?? params.slug ?? '';
  const { data: published, isLoading } = usePublishedModules();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner label="Chargement…" />
      </div>
    );
  }

  const entry = published?.find((m) => m.registry.slug === slug);

  // Non publié / inconnu → on renvoie au hub (impossible d'y accéder à la main).
  if (!entry) {
    return <Navigate to="/modules" replace />;
  }

  // Publié mais « bientôt » → non jouable.
  if (normalizeModuleStatus(entry.row.status) === 'bientot') {
    const title = entry.row.custom_title || entry.registry.title;
    return (
      <Section eyebrow="Académie" title={title}>
        <Card className="max-w-xl mx-auto">
          <CardBody className="p-8 text-center space-y-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-atfr-gold/40 bg-atfr-ink/80 text-atfr-gold">
              <Hourglass size={26} strokeWidth={1.6} />
            </div>
            <div>
              <p className="font-display text-xl text-atfr-bone">
                Bientôt disponible
              </p>
              <p className="text-sm text-atfr-fog mt-2">
                Ce module arrive prochainement. Reviens vite — il sera jouable
                dès sa mise en ligne.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/modules">
                <Button variant="outline" leadingIcon={<ArrowLeft size={14} />}>
                  Retour au hub
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </Section>
    );
  }

  return <Outlet />;
}
