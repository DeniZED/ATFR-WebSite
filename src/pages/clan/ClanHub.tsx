import { useState } from 'react';
import { Link2, Map, Sparkles, Wrench } from 'lucide-react';
import { Section, Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useClanPage } from '@/features/clan/pageQueries';

const CLAN_HUB_SLUG = 'clan-hub';

type TabId = 'equipement' | 'competences' | 'strategies' | 'liens';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Wrench;
  title: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'equipement',
    label: 'Équipement',
    icon: Wrench,
    title: 'Bien équiper ses chars',
    description:
      'Configurations d’équipement recommandées par char pour le clan.',
  },
  {
    id: 'competences',
    label: 'Compétences',
    icon: Sparkles,
    title: 'Compétences d’équipage',
    description:
      'Ordre des compétences à prioriser selon le rôle du char.',
  },
  {
    id: 'strategies',
    label: 'Stratégies',
    icon: Map,
    title: 'Stratégies par carte',
    description:
      'Placements, rotations et plans de jeu carte par carte.',
  },
  {
    id: 'liens',
    label: 'Liens utiles',
    icon: Link2,
    title: 'Liens utiles',
    description:
      'Ressources externes : guides, outils et contenus recommandés.',
  },
];

export default function ClanHub() {
  const page = useClanPage(CLAN_HUB_SLUG);
  const [active, setActive] = useState<TabId>('equipement');
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <Section
      eyebrow="Espace clan"
      title={page.data?.title ?? 'Espace clan'}
      description={
        page.data?.description ??
        'Ressources réservées aux membres : équipement, compétences, stratégies et liens utiles.'
      }
      className="pt-10 sm:pt-16"
    >
      {/* Onglets */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold'
                  : 'border-atfr-gold/10 bg-atfr-graphite/40 text-atfr-fog hover:text-atfr-bone',
              )}
            >
              <Icon size={16} strokeWidth={1.6} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Contenu de l'onglet actif */}
      <Card>
        <CardBody className="p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 shrink-0 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
              <tab.icon size={22} strokeWidth={1.6} />
            </div>
            <div>
              <h3 className="font-display text-2xl text-atfr-bone">
                {tab.title}
              </h3>
              <p className="text-sm text-atfr-fog mt-1">{tab.description}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-xl border border-dashed border-atfr-gold/15 bg-atfr-ink/30">
            <p className="text-sm text-atfr-fog">
              Contenu à venir — section « {tab.label} ».
            </p>
            <p className="text-xs text-atfr-fog/60 max-w-md text-center">
              Cette section est prête à être développée. Le contenu sera ajouté
              progressivement par l’équipe.
            </p>
          </div>
        </CardBody>
      </Card>
    </Section>
  );
}
