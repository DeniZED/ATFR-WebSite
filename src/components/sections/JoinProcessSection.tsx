import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Gamepad2, MessageCircle, type LucideIcon } from 'lucide-react';
import { Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    icon: FileText,
    title: 'Postule',
    text: 'Remplis le formulaire avec tes infos utiles : pseudo, stats et disponibilités.',
  },
  {
    icon: MessageCircle,
    title: 'Passe sur Discord',
    text: 'On échange rapidement, on répond à tes questions et on fait connaissance.',
  },
  {
    icon: Gamepad2,
    title: 'Joue avec le clan',
    text: 'Quelques games ensemble en Bastion ou en soirée pour valider le feeling.',
  },
];

/**
 * « Comment rejoindre ATFR » : le processus en 3 étapes, juste avant le CTA
 * final, pour lever les freins à la candidature.
 */
export function JoinProcessSection() {
  const { get } = useContent();
  const invite = get('discord_invite_url');

  return (
    <Section
      id="comment-rejoindre"
      eyebrow="C'est simple"
      title="Comment rejoindre ATFR"
      description="Trois étapes, quelques minutes, et tu es des nôtres."
    >
      <ol className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            className="spotlight-card relative rounded-xl border border-atfr-gold/15 bg-atfr-carbon/80 p-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-ink font-display text-lg text-atfr-gold">
                {i + 1}
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-atfr-gold/25 bg-atfr-gold/10 text-atfr-gold">
                <step.icon size={17} strokeWidth={1.7} />
              </span>
            </div>
            <h3 className="mt-4 font-display text-xl uppercase tracking-tight text-atfr-bone">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-atfr-fog">{step.text}</p>
          </motion.li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/recrutement"
          className="rounded-lg bg-gradient-to-br from-atfr-gold-light to-atfr-gold px-5 py-2.5 font-display text-sm uppercase tracking-wide text-atfr-ink transition-transform hover:-translate-y-0.5"
        >
          Postuler maintenant
        </Link>
        {invite && (
          <a
            href={invite}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-atfr-gold/35 bg-atfr-graphite/40 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-atfr-bone transition-colors hover:border-atfr-gold/60"
          >
            Rejoindre le Discord
          </a>
        )}
      </div>
    </Section>
  );
}
