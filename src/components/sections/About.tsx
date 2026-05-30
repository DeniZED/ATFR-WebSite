import { motion } from 'framer-motion';
import { Flame, HeartHandshake, Swords, Target } from 'lucide-react';
import { Card, CardBody, Section } from '@/components/ui';
import { useContent } from '@/hooks/useContent';

const values = [
  {
    icon: Swords,
    title: 'Compétitif',
    text: 'Entraînements hebdomadaires, stratégie en équipe et participation aux tournois communautaires.',
  },
  {
    icon: HeartHandshake,
    title: 'Communauté',
    text: "Un Discord francophone actif, des soirées pleine équipe, de l'entraide et du fun au quotidien.",
  },
  {
    icon: Target,
    title: 'Progression',
    text: 'Coaching entre membres, analyses de replays, partage de setups et de compositions gagnantes.',
  },
  {
    icon: Flame,
    title: 'Engagé',
    text: 'Campagnes globales, escarmouches, événements spéciaux — on joue pour gagner du steel.',
  },
];

export function About() {
  const { get } = useContent();
  return (
    <Section
      id="about"
      eyebrow={get('about_eyebrow')}
      title={get('about_title')}
      description={get('about_text')}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Card className="h-full">
              <CardBody className="p-6">
                <div className="h-10 w-10 rounded-md bg-atfr-gold/10 border border-atfr-gold/30 flex items-center justify-center text-atfr-gold mb-4">
                  <v.icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-atfr-bone mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-atfr-fog leading-relaxed">{v.text}</p>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
