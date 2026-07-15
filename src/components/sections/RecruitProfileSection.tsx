import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Gamepad2,
  Headphones,
  Heart,
  Swords,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Section } from '@/components/ui';

interface Trait {
  icon: LucideIcon;
  title: string;
  text: string;
}

const TRAITS: Trait[] = [
  {
    icon: Gamepad2,
    title: 'Joueur actif',
    text: 'Tu joues régulièrement et tu as envie de t’investir dans la vie du clan.',
  },
  {
    icon: Headphones,
    title: 'Présent sur Discord',
    text: 'Tu es à l’aise à l’oral et connecté pendant les activités clan.',
  },
  {
    icon: TrendingUp,
    title: 'Envie de progresser',
    text: 'Tu cherches à monter ton niveau et à apprendre des meilleurs.',
  },
  {
    icon: Target,
    title: 'Respect des consignes',
    text: 'En Bastion et en Clan Wars, tu suis les stratégies et les appels.',
  },
  {
    icon: Swords,
    title: 'Présent en activité clan',
    text: 'Tu participes aux Bastions, Clan Wars et événements selon tes dispos.',
  },
  {
    icon: Heart,
    title: 'Bonne mentalité',
    text: 'Sérieux quand il faut, détente le reste du temps — et jamais toxique.',
  },
  {
    icon: CheckCircle2,
    title: 'Fiable',
    text: 'Quand tu t’engages sur une soirée, on peut compter sur toi.',
  },
];

/**
 * « Le profil que nous recherchons » : grille des attentes de recrutement,
 * placée juste avant le processus de candidature.
 */
export function RecruitProfileSection() {
  return (
    <Section
      id="profil"
      eyebrow="Recrutement"
      title="Le profil que nous recherchons"
      description="On cherche des joueurs impliqués, pas des robots."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TRAITS.map((trait, i) => (
          <motion.article
            key={trait.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            className="spotlight-card flex items-start gap-4 rounded-xl border border-atfr-gold/15 bg-atfr-carbon/80 p-5"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
              <trait.icon size={20} strokeWidth={1.6} />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg uppercase tracking-tight text-atfr-bone">
                {trait.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-atfr-fog">{trait.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </Section>
  );
}
