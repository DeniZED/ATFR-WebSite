import React from 'react';
import { Users, Trophy, Target, Swords } from 'lucide-react';

const stats = [
  {
    id: 1,
    name: "Membres Actifs",
    value: "73",
    change: "+5%",
    icon: Users
  },
  {
    id: 2,
    name: "Victoires (30j)",
    value: "245",
    change: "+12%",
    icon: Trophy
  },
  {
    id: 3,
    name: "WR Moyen",
    value: "54.8%",
    change: "+0.3%",
    icon: Target
  },
  {
    id: 4,
    name: "Batailles Clan",
    value: "1,234",
    change: "+8%",
    icon: Swords
  }
];

export default function Statistics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-wot-gold">Statistiques du Clan</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.id}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-8 w-8 text-wot-gold" strokeWidth={1.5} />
              <span className={`text-sm ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-wot-light/80">{stat.name}</h3>
              <p className="text-2xl font-bold text-wot-goldLight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder pour futurs graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6 h-96">
          <h3 className="text-lg font-medium text-wot-goldLight mb-4">
            Activité Mensuelle
          </h3>
          <div className="flex items-center justify-center h-full text-wot-light/50">
            Graphique d'activité
          </div>
        </div>
        <div className="card p-6 h-96">
          <h3 className="text-lg font-medium text-wot-goldLight mb-4">
            Performance du Clan
          </h3>
          <div className="flex items-center justify-center h-full text-wot-light/50">
            Graphique de performance
          </div>
        </div>
      </div>
    </div>
  );
}