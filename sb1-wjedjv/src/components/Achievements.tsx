import React from 'react';
import { useInView } from '../hooks/useInView';
import { Trophy } from 'lucide-react';

const achievements = [
  {
    icon: Trophy,
    image: "https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",
    title: "Manoeuvres",
    description: "En cours... - Novembre 2024",
    stats: ["Position FR : ?", "Batailles : ?", "Chars gagnés : ?"]
  },
  {
    icon: Trophy,
    image: "https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",
    title: "Manoeuvres",
    description: "Top 14 FR - Mars 2024",
    stats: ["Position FR : 14", "Batailles : +1000", "Chars gagnés : 6"]
  },
  {
    icon: Trophy,
    image: "https://eu-wotp.wgcdn.co/dcont/fb/image/strongholds_maneuvers_event_1920x900.jpg",
    title: "Manoeuvres",
    description: "Top 9 FR - Août 2023",
    stats: ["Position FR : 9", "Batailles : +750", "Chars gagnés : 12"]
  },
  {
    icon: Trophy,
    image: "https://eu-wotp.wgcdn.co/dcont/fb/image/global_map_winter_event_1920h900.jpg",
    title: "Dieu de la guerre",
    description: "Top 12 FR - Février 2023",
    stats: ["Position FR : 12", "Batailles : +420", "Chars gagnés : 21"]
  }
];

export default function Achievements() {
  const [ref, isInView] = useInView();

  return (
    <section className="py-20 bg-wot-gradient" id="achievements">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="section-title">Nos Derniers Exploits</h2>
          <p className="section-subtitle">
            Des années d'excellence et de victoires qui ont forgé notre réputation
          </p>
        </div>
        <div 
          ref={ref}
          className="grid md:grid-cols-2 gap-8"
        >
          {achievements.map((achievement, index) => (
            <div 
              key={index} 
              className={`card overflow-hidden transition-all duration-1000 transform
                ${isInView 
                  ? 'opacity-100 translate-x-0' 
                  : index % 2 === 0 
                    ? 'opacity-0 -translate-x-20' 
                    : 'opacity-0 translate-x-20'
                }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative h-48">
                <img 
                  src={achievement.image}
                  alt={achievement.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wot-dark via-wot-dark/50 to-transparent" />
                <achievement.icon 
                  className="absolute bottom-4 right-4 h-10 w-10 text-wot-gold" 
                  strokeWidth={1.5}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-wot-goldLight">{achievement.title}</h3>
                <p className="text-wot-light/80 mb-4">{achievement.description}</p>
                <div className="grid grid-cols-3 gap-4">
                  {achievement.stats.map((stat, statIndex) => (
                    <div 
                      key={statIndex}
                      className="bg-wot-darker p-2 rounded text-center text-sm border border-wot-gold/10 text-wot-light/90"
                    >
                      {stat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}