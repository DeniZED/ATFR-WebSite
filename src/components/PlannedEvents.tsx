import React from 'react';
import { useInView } from '../hooks/useInView';
import { Calendar, Clock, MapPin } from 'lucide-react';

const events = [
  {
    id: '1',
    title: "Aucun événement à venir",
    type: "N/A",
    description: "",
    date: "",
    time: "",
    backgroundImage: "https://images.unsplash.com/photo-1624687943971-e86af76d57de?q=80&w=2070"
  },
  {
    id: '2',
    title: "",
    type: "",
    description: "",
    date: "",
    time: "",
    backgroundImage: ""
  },
  {
    id: '3',
    title: "",
    type: "",
    description: "",
    date: "",
    time: "",
    backgroundImage: ""
  }
];

export default function PlannedEvents() {
  const [ref, isInView] = useInView();

  if (events.length === 0) return null;

  return (
    <section className="py-20 bg-wot-darker" id="planned-events">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Événements Planifiés</h2>
          <p className="section-subtitle">
            Découvrez nos prochains événements et rejoignez-nous pour des moments inoubliables
          </p>
        </div>

        <div 
          ref={ref}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`transform transition-all duration-700
                ${isInView 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-20'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative group h-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center rounded-lg"
                  style={{ 
                    backgroundImage: `url(${event.backgroundImage})`,
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-wot-darker via-wot-darker/90 to-wot-darker/70 
                              group-hover:from-wot-darker/95 group-hover:via-wot-darker/85 group-hover:to-wot-darker/75
                              transition-all duration-300 rounded-lg" />
                
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-wot-gold/20 
                                   text-wot-gold mb-4">
                      {event.type}
                    </span>
                    <h3 className="text-xl font-bold text-wot-goldLight mb-3">
                      {event.title}
                    </h3>
                    <p className="text-wot-light/80 mb-6">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-wot-light/60">
                      <Calendar className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      {event.date}
                    </div>
                    <div className="flex items-center text-wot-light/60">
                      <Clock className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      {event.time}
                    </div>
                    <div className="flex items-center text-wot-light/60">
                      <MapPin className="h-4 w-4 mr-2" strokeWidth={1.5} />
                      Discord ATFR
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}