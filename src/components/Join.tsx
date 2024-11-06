import React from 'react';
import { ArrowRight, CheckCircle, Shield, Trophy, Users, Target } from 'lucide-react';
import { useInView } from '../hooks/useInView';

const requirements = [
  {
    icon: Shield,
    title: "Équipement",
    items: [
      "Minimum 20 chars Tier X",
      "Chars méta actuels",
      "Équipements optimisés"
    ]
  },
  {
    icon: Trophy,
    title: "Performance",
    items: [
      "WN8 > 2000",
      "Winrate > 52%",
      "Connaissance méta"
    ]
  },
  {
    icon: Users,
    title: "Engagement",
    items: [
      "Participation active",
      "Communication Discord",
      "Esprit d'équipe"
    ]
  },
  {
    icon: Target,
    title: "Disponibilité",
    items: [
      "Présence régulière",
      "Participation campagnes",
      "Entraînements hebdo"
    ]
  }
];

export default function Join() {
  const [ref, isInView] = useInView();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800" id="join">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">Rejoignez ATFR</h2>
          <p className="section-subtitle">
            Vous pensez avoir ce qu'il faut pour rejoindre l'élite? Découvrez nos critères de recrutement
          </p>
        </div>
        <div 
          ref={ref}
          className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 transition-all duration-1000 transform
            ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          {requirements.map((req, index) => (
            <div 
              key={index}
              className="card p-6 rounded-lg"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <req.icon className="h-8 w-8 text-wot-gold mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-4">{req.title}</h3>
              <ul className="space-y-2">
                {req.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex}
                    className="flex items-center text-wot-light"
                  >
                    <CheckCircle className="h-4 w-4 text-wot-goldLight mr-2" strokeWidth={1.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center space-y-6">
          <a 
            href="https://forms.gle/t79J5UqzUnA7t7YF8"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary clip-diagonal inline-flex items-center"
          >
            Postuler Maintenant
            <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
          </a>
          <p className="text-wot-light/80">
            Ou{' '}
            <a 
              href="https://discord.gg/wxhUYVaKYr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wot-gold hover:text-wot-goldLight transition-colors"
            >
              rejoignez notre Discord
            </a>
            {' '}pour plus d'informations
          </p>
        </div>
      </div>
    </section>
  );
}