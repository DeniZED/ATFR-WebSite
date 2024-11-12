import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { 
  Swords, 
  Target, 
  Castle, 
  Trophy,
  Calendar,
  Users,
  Timer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PlannedEvents from './PlannedEvents';

const defaultActivities = [
  {
    icon: Swords,
    title: "Clan Wars",
    schedule: "Campagnes Globales",
    description: "Participez aux batailles stratégiques pour le contrôle de la carte globale",
    frequency: "Événements saisonniers"
  },
  {
    icon: Target,
    title: "Incursions",
    schedule: "Tier X",
    description: "Affrontez d'autres clans en 15v15 dans des batailles tactiques intenses",
    frequency: "Sessions quotidiennes"
  },
  {
    icon: Castle,
    title: "Bastion",
    schedule: "Tiers VIII & X",
    description: "Mode compétitif 7v7 avec stratégies avancées et coordination d'équipe",
    frequency: "Plusieurs fois par semaine"
  }
];

export default function Activities() {
  const [ref, isInView] = useInView();
  const [showEvents, setShowEvents] = useState(false);

  return (
    <section className="py-20 bg-wot-darker relative overflow-hidden" id="activities">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 grid grid-cols-6 gap-px">
          {[...Array(42)].map((_, i) => (
            <div key={i} className="border border-wot-gold/10" />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="section-title">Notre Activité</h2>
          <p className="section-subtitle">
            Un programme varié d'activités pour tous les styles de jeu et tous les niveaux
          </p>
        </div>

        <div 
          ref={ref}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {defaultActivities.map((activity, index) => (
            <div
              key={index}
              className={`card group p-6 relative overflow-hidden
                transform transition-all duration-700
                ${isInView 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-wot-gold/5 rounded-bl-full 
                            transform group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-start gap-4">
                <activity.icon 
                  className="h-8 w-8 text-wot-gold shrink-0" 
                  strokeWidth={1.5} 
                />
                <div>
                  <h3 className="text-xl font-bold text-wot-goldLight mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-wot-gold/80 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" strokeWidth={1.5} />
                    {activity.schedule}
                  </p>
                  <p className="text-wot-light/80 mb-3">
                    {activity.description}
                  </p>
                  <p className="text-sm text-wot-light/60 flex items-center gap-2">
                    <Timer className="h-4 w-4" strokeWidth={1.5} />
                    {activity.frequency}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="btn-secondary inline-flex items-center gap-2 group"
          >
            {showEvents ? 'Masquer les événements' : 'Voir les événements planifiés'}
            {showEvents ? (
              <ChevronUp className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
            ) : (
              <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
            )}
          </button>
        </div>

        {showEvents && (
          <div className="mt-20 animate-slideDown">
            <PlannedEvents />
          </div>
        )}
      </div>
    </section>
  );
}