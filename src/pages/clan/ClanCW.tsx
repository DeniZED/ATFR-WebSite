import { Swords } from 'lucide-react';
import { Section } from '@/components/ui';

export default function ClanCW() {
  return (
    <Section
      eyebrow="Espace membres"
      title="Clan Wars"
      description="Inscriptions et organisation des clan wars ATFR."
      className="pt-10 sm:pt-16"
    >
      <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-atfr-gold/15 bg-atfr-graphite/40">
        <div className="h-14 w-14 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
          <Swords size={26} strokeWidth={1.6} />
        </div>
        <p className="text-sm text-atfr-fog">Contenu à venir — inscriptions CW.</p>
      </div>
    </Section>
  );
}
