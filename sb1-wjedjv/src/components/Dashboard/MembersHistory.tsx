import React, { useState } from 'react';
import { Search, Trash2, UserPlus, UserMinus } from 'lucide-react';
import { useMembersStore } from '../../stores/membersStore';

export default function MembersHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const { clanActivities, clearActivities } = useMembersStore();

  const filteredActivities = clanActivities.filter(activity =>
    activity.account_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wot-gold">Journal d'Activité du Clan</h1>
        <button 
          onClick={clearActivities}
          className="btn-secondary flex items-center text-red-500 hover:text-red-400 border-red-500/30"
        >
          <Trash2 className="h-5 w-5 mr-2" strokeWidth={1.5} />
          Vider l'historique
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher un membre..."
          className="w-full pl-10 pr-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-wot-light/50" strokeWidth={1.5} />
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity, index) => (
          <div 
            key={`${activity.account_id}-${activity.timestamp}`}
            className="card p-4 flex items-center space-x-4"
          >
            {activity.type === 'join' ? (
              <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-green-400" strokeWidth={1.5} />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-red-900/30 flex items-center justify-center">
                <UserMinus className="h-5 w-5 text-red-400" strokeWidth={1.5} />
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-wot-goldLight">
                  {activity.account_name}
                </h3>
                <span className="text-sm text-wot-light/60">
                  {formatDateTime(activity.timestamp)}
                </span>
              </div>
              
              <p className="text-wot-light/80">
                {activity.type === 'join' ? 'A rejoint' : 'A quitté'} le clan
                {activity.role_i18n && ` en tant que ${activity.role_i18n}`}
                {activity.reason && ` - Raison: ${activity.reason}`}
              </p>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center text-wot-light/60 py-8">
            Aucune activité enregistrée
          </div>
        )}
      </div>
    </div>
  );
}