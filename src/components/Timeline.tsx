import React from 'react';
import { useInView } from '../hooks/useInView';
import { Trophy, Star, Flag, Award, Users, Target } from 'lucide-react';

const timelineEvents = [
  {
    date: '2020',
    title: 'Création du clan',
    description: 'Fondation d\'ATFR avec une vision claire : devenir l\'un des clans français le plus actif et respecté',
    icon: Flag,
    type: 'success'
  },
  {
    date: '2021',
    title: 'La naissance du clan',
    description: 'Première apparition lors de la campagne "Front orageux"',
    icon: Trophy,
    type: 'achievement'
  },
  {
    date: '2022',
    title: 'Développement',
    description: 'Le clan atteint ses records d\'actifs, une étape importante dans notre croissance',
    icon: Users,
    type: 'milestone'
  },
  {
    date: '2023',
    title: 'Croissance',
    description: 'ATFR continue son développement et s\'impose lors de la campagne "Front orageux" et sort 21 chars récompense !',
    icon: Star,
    type: 'achievement'
  },
  {
    date: '2024',
    title: 'Top 5 Français',
    description: 'ATFR s\'impose comme l\'un des 5 meilleurs clans français',
    icon: Trophy,
    type: 'achievement'
  },
  {
    date: '2025',
    title: 'Objectifs',
    description: 'En route vers le top clan français en terme d\'activité et de réussites',
    icon: Target,
    type: 'current'
  }
];

export default function Timeline() {
  const [ref, isInView] = useInView();

  return (
    <section className="py-20 bg-wot-darker relative overflow-hidden" id="timeline">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('https://eu-wotp.wgcdn.co/dcont/fb/image/wall_pattern.png')] bg-repeat opacity-10" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Notre Histoire</h2>
          <p className="section-subtitle">
            L'évolution d'ATFR à travers les années
          </p>
        </div>

        <div 
          ref={ref}
          className="relative"
        >
          {/* Ligne centrale */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-wot-gold/20" />

          {timelineEvents.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={index}
                className={`flex items-center mb-12 ${isEven ? 'justify-start' : 'justify-end'} relative`}
              >
                {/* Point central */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-wot-gold" />
                
                {/* Contenu */}
                <div 
                  className={`w-5/12 ${isEven ? 'pr-12' : 'pl-12'}
                    ${isInView ? 'opacity-100 translate-x-0' : isEven ? 'opacity-0 -translate-x-12' : 'opacity-0 translate-x-12'}
                    transition-all duration-1000 ease-out`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="bg-wot-dark p-6 rounded-lg border border-wot-gold/20 hover:border-wot-gold/40 
                                transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-wot-gold/10 group-hover:scale-110 transition-transform duration-300
                                    ${event.type === 'achievement' ? 'text-yellow-500' :
                                      event.type === 'milestone' ? 'text-blue-500' :
                                      event.type === 'current' ? 'text-green-500' : 'text-wot-gold'}`}>
                        <event.icon className="h-6 w-6" strokeWidth={1.5} />
                      </div>
                      <div>
                        <span className="text-sm text-wot-gold font-medium">{event.date}</span>
                        <h3 className="text-xl font-bold text-wot-goldLight mb-2">{event.title}</h3>
                        <p className="text-wot-light/80">{event.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}