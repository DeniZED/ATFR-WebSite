import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Section } from '@/components/ui';

export function JoinCta() {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-2xl border border-atfr-gold/20 bg-gradient-to-br from-atfr-carbon via-atfr-graphite to-atfr-carbon p-10 sm:p-16 text-center">
        <div className="absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20" aria-hidden />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold mb-4">
            Recrutement ouvert
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-atfr-bone">
            Envie de rejoindre le <span className="text-gradient-gold">clan</span> ?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-atfr-fog leading-relaxed">
            Formulaire rapide, vérification auto des stats via l'API WoT, réponse
            sous quelques jours. Que vous soyez vétéran ou en progression, on a
            quelque chose pour vous.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link to="/recrutement">
              <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
                Postuler maintenant
              </Button>
            </Link>
            <Link to="/membres">
              <Button variant="outline" size="lg">
                Voir la liste des membres
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
