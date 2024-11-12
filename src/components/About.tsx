import React, { useState } from 'react';
import { Trophy, Users, Target, Award, Swords, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useInView } from '../hooks/useInView';
import Timeline from './Timeline';

const features = [
  {
    icon: Trophy,
    title: "Objectifs",
    description: "Notre mission est de développer la communauté ATFR pour en faire le clan français le plus attractif et performant. Nous visons l'excellence à travers une progression constante et un esprit d'équipe inégalé."
  },
  {
    icon: Users,
    title: "Communauté",
    description: "Plus de 70 joueurs passionnés forment notre famille, unis par le même amour du jeu et le désir de progresser ensemble. Notre force réside dans notre cohésion et notre entraide mutuelle."
  },
  {
    icon: Target,
    title: "Excellence",
    description: "Notre programme de formation continue permet à chaque membre de s'améliorer. Des sessions d'entraînement régulières et un partage constant des connaissances assurent notre progression collective."
  },
  {
    icon: Award,
    title: "Compétition",
    description: "Nous participons activement aux plus grands événements compétitifs de World of Tanks. Chaque tournoi est une opportunité de démontrer notre valeur et de repousser nos limites."
  },
  {
    icon: Swords,
    title: "Stratégie",
    description: "Notre équipe développe et adapte constamment ses tactiques pour rester compétitive. La maîtrise du méta-game et l'innovation stratégique sont au cœur de notre approche."
  },
  {
    icon: Shield,
    title: "Valeurs",
    description: "Le respect, l'engagement et l'esprit d'équipe sont nos fondements. Ces valeurs guident chacune de nos actions et font la force de notre communauté depuis 2020."
  }
];

export default function About() {
  const [ref, isInView] = useInView();
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <section className="py-20 px-4 bg-wot-gradient" id="about">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="section-title">Notre Clan</h2>
          <p className="section-subtitle">
            Fondé en 2020, ATFR s'est rapidement imposé comme l'un des clans les plus actifs et respectés de la scène World of Tanks française. Notre engagement envers l'excellence et notre esprit communautaire nous distinguent.
          </p>
        </div>
        <div 
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`card p-8 rounded-lg transform transition-all duration-1000
                ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <feature.icon className="h-10 w-10 text-wot-gold mb-6" strokeWidth={1.5} />
              <h3 className="text-xl font-bold mb-4 text-wot-goldLight">{feature.title}</h3>
              <p className="text-wot-light/80 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="btn-secondary inline-flex items-center gap-2 group"
          >
            {showTimeline ? 'Masquer notre histoire' : 'Découvrir notre histoire'}
            {showTimeline ? (
              <ChevronUp className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            )}
          </button>
        </div>

        {showTimeline && (
          <div className="mt-20 animate-slideDown">
            <Timeline />
          </div>
        )}
      </div>
    </section>
  );
}