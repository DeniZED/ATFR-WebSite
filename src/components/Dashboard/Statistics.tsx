import React from 'react';
import { Users, Trophy, Target, Swords } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Données statiques pour le graphique
const sampleData = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, '0')}/03`,
  count: Math.floor(Math.random() * 50) + 20
}));

// Données statiques pour les stats
const clanStats = {
  members_count: 72,
  battles_avg: 35,
  efficiency: 8750,
  global_rating: 9200
};

const statCards = [
  {
    id: 1,
    name: "Membres",
    value: clanStats.members_count,
    icon: Users
  },
  {
    id: 2,
    name: "Batailles/Jour",
    value: Math.round(clanStats.battles_avg),
    icon: Trophy
  },
  {
    id: 3,
    name: "Efficacité",
    value: Math.round(clanStats.efficiency).toLocaleString(),
    icon: Target
  },
  {
    id: 4,
    name: "Rating Global",
    value: Math.round(clanStats.global_rating).toLocaleString(),
    icon: Swords
  }
];

export default function Statistics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wot-gold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div 
            key={stat.id}
            className="card p-6"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-8 w-8 text-wot-gold" strokeWidth={1.5} />
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-wot-light/80">{stat.name}</h3>
              <p className="text-2xl font-bold text-wot-goldLight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-medium text-wot-goldLight mb-6">
          Activité du Clan (30 jours)
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis 
                dataKey="date" 
                stroke="#999999"
                tick={{ fill: '#999999' }}
              />
              <YAxis 
                stroke="#999999"
                tick={{ fill: '#999999' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E1E',
                  border: '1px solid rgba(244, 178, 35, 0.2)',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#F4B223" 
                name="Batailles"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}