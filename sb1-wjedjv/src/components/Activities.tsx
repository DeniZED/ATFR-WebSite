import React from 'react';
import { useInView } from '../hooks/useInView';
import { useEventsStore } from '../stores/eventsStore';
import { 
  Swords, 
  Target, 
  Castle, 
  Trophy,
  Gamepad2,
  Calendar,
  Users,
  Timer,
  CalendarDays
} from 'lucide-react';

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
  const { events } = useEventsStore();
  const publicEvents = events.filter(event => event.isPublic);

  return (
    <section className="py-20 bg-wot-darker relative overflow-hidden" id="activities">
      {/* Background Pattern */}
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
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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

          {publicEvents.map((event, index) => (
            <div
              key={event.id}
              className={`card group p-6 relative overflow-hidden
                transform transition-all duration-700
                ${isInView 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${(index + defaultActivities.length) * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-wot-gold/5 rounded-bl-full 
                            transform group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-start gap-4">
                <CalendarDays
                  className="h-8 w-8 text-wot-gold shrink-0" 
                  strokeWidth={1.5} 
                />
                <div>
                  <h3 className="text-xl font-bold text-wot-goldLight mb-1">
                    {event.title}
                  </h3>
                  <p className="text-sm text-wot-gold/80 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" strokeWidth={1.5} />
                    {event.date} à {event.time}
                  </p>
                  <p className="text-wot-light/80 mb-3">
                    {event.description}
                  </p>
                  <p className="text-sm text-wot-light/60">
                    <span className="px-2 py-1 text-xs rounded-full bg-wot-gold/20 text-wot-gold">
                      {event.type}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}