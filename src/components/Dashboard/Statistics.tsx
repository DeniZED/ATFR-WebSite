import React, { useEffect, useState } from 'react';
import { Users, Trophy, Target, Swords, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { fetchDashboardStats, DashboardStats } from '../../services/dashboardApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      setRefreshing(true);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 text-wot-gold animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  const statCards = [
    {
      id: 1,
      name: "Membres",
      value: stats?.members_count || 0,
      icon: Users
    },
    {
      id: 2,
      name: "Batailles/Jour",
      value: Math.round(stats?.battles_avg || 0),
      icon: Trophy
    },
    {
      id: 3,
      name: "Efficacité",
      value: Math.round(stats?.efficiency || 0).toLocaleString(),
      icon: Target
    },
    {
      id: 4,
      name: "Rating Global",
      value: Math.round(stats?.global_rating || 0).toLocaleString(),
      icon: Swords
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wot-gold">Dashboard</h1>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          <p className="flex-1">{error}</p>
        </div>
      )}

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
            <LineChart data={stats?.daily_battles || []}>
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