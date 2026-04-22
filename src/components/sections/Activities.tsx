import { CalendarClock, Gamepad2, Trophy, Users } from 'lucide-react';
import { Card, CardBody, Section } from '@/components/ui';

const items = [
  {
    icon: CalendarClock,
    title: 'Entraînements',
    text: 'Sessions planifiées sur Discord avec briefs, VOD review et progression par rôle.',
  },
  {
    icon: Trophy,
    title: 'Compétitions',
    text: 'Participation régulière aux tournois officiels et communautaires FR / EU.',
  },
  {
    icon: Gamepad2,
    title: 'Soirées clan',
    text: 'Pelotons spontanés, escadrons, fun stacks — rejoignez le vocal, il y a toujours du monde.',
  },
  {
    icon: Users,
    title: 'Clan frère',
    text: 'A-T-O accueille les joueurs plus chill ou en montée en compétence, avec les mêmes valeurs.',
  },
];

export function Activities() {
  return (
    <Section
      eyebrow="Activités"
      title="Ce qu'on fait, ensemble"
      description="On n'a pas besoin de vous pousser à vous connecter. Entre les soirées, les stratégies, et les campagnes, il y a toujours quelque chose en cours."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <Card key={it.title}>
            <CardBody className="p-6">
              <it.icon
                size={28}
                className="text-atfr-gold mb-4"
                strokeWidth={1.5}
              />
              <h3 className="font-display text-lg text-atfr-bone mb-2">
                {it.title}
              </h3>
              <p className="text-sm text-atfr-fog leading-relaxed">{it.text}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Section>
  );
}
