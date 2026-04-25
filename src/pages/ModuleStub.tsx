import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Hourglass } from 'lucide-react';
import { Button, Card, CardBody, Section } from '@/components/ui';
import { getModule } from '@/features/modules/registry';
import { usePublishedModules } from '@/features/modules/queries';

/**
 * Generic placeholder for modules registered in code but whose actual
 * implementation isn't shipped yet. Resolves the slug from the URL and
 * shows the registry metadata + a "back to hub" CTA. Each real module
 * will replace this with its own page when implemented.
 */
export default function ModuleStub() {
  const { slug = '' } = useParams<{ slug: string }>();
  const mod = getModule(slug);
  const { data: published } = usePublishedModules();

  if (!mod) {
    return (
      <Section eyebrow="Académie" title="Module inconnu">
        <p className="text-center text-atfr-fog">
          Aucun module ne correspond à cette URL.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/modules">
            <Button variant="outline" leadingIcon={<ArrowLeft size={14} />}>
              Retour au hub
            </Button>
          </Link>
        </div>
      </Section>
    );
  }

  const Icon = mod.icon;

  return (
    <Section eyebrow="Académie" title={mod.title} description={mod.description}>
      <Card className="max-w-xl mx-auto">
        <CardBody className="p-8 text-center space-y-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl border border-atfr-gold/40 bg-atfr-ink/80 text-atfr-gold">
            <Icon size={26} strokeWidth={1.6} />
          </div>
          <div>
            <p className="font-display text-xl text-atfr-bone flex items-center justify-center gap-2">
              <Hourglass size={18} className="text-atfr-gold" />
              Implémentation en cours
            </p>
            <p className="text-sm text-atfr-fog mt-2">
              Ce module est référencé dans le hub mais son contenu arrive
              dans une prochaine mise à jour. Reviens plus tard.
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

      {/* Cross-promo : uniquement les modules publiés */}
      {published && published.length > 1 && (
        <div className="mt-12 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3 text-center">
            Autres modules
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {published
              .filter(({ registry }) => registry.slug !== mod.slug)
              .map(({ registry: m }) => (
                <Link
                  key={m.slug}
                  to={`/modules/${m.path}`}
                  className="rounded-lg border border-atfr-gold/15 bg-atfr-carbon p-4 hover:border-atfr-gold/40 transition-colors"
                >
                  <p className="font-medium text-atfr-bone">{m.title}</p>
                  <p className="text-xs text-atfr-fog mt-1 line-clamp-2">
                    {m.description}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      )}
    </Section>
  );
}
