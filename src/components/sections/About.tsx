import { Flame, HeartHandshake, Swords, Target } from 'lucide-react';
import { Card, CardBody, Section } from '@/components/ui';

const values = [
  {
    icon: Swords,
    title: 'Compétitif',
    text: 'Entraînements hebdomadaires, stratégie en équipe et participation aux tournois communautaires.',
  },
  {
    icon: HeartHandshake,
    title: 'Communauté',
    text: 'Un Discord francophone actif, des soirées pleine équipe, de l\'entraide et du fun au quotidien.',
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
  return (
    <Section
      id="about"
      eyebrow="Qui sommes-nous"
      title="Un clan FR pensé pour durer"
      description="ATFR rassemble des joueurs francophones qui aiment progresser ensemble. Pas de pression débile, mais une vraie exigence sur l'état d'esprit : fair-play, régularité, et envie de gagner."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <Card key={v.title}>
            <CardBody className="p-6">
              <div className="h-10 w-10 rounded-md bg-atfr-gold/10 border border-atfr-gold/30 flex items-center justify-center text-atfr-gold mb-4">
                <v.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-xl text-atfr-bone mb-2">{v.title}</h3>
              <p className="text-sm text-atfr-fog leading-relaxed">{v.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
