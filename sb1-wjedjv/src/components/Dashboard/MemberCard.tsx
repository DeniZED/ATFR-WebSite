import React from 'react';
import { Shield, MessageCircle, ExternalLink, Timer, AlertCircle } from 'lucide-react';
import { ClanMember, PlayerStats } from './types';

interface MemberCardProps {
  member: ClanMember;
  stats?: { lastBattleTime: number };
  onEditDiscord: (memberId: number) => void;
}

export default function MemberCard({ member, stats, onEditDiscord }: MemberCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastActivity = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    return formatDate(timestamp);
  };

  const getActivityColor = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60));
    
    if (days <= 2) return 'text-green-400';
    if (days <= 7) return 'text-yellow-400';
    if (days <= 14) return 'text-orange-400';
    return 'text-red-400';
  };

  const isOnline = (timestamp: number) => {
    const now = Date.now() / 1000;
    return (now - timestamp) < (15 * 60); // 15 minutes
  };

  return (
    <div className="card p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Member Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-wot-darker flex items-center justify-center">
              <Shield className="h-6 w-6 text-wot-gold" strokeWidth={1.5} />
            </div>
            {stats && (
              <div 
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-wot-darker
                  ${isOnline(stats.lastBattleTime) ? 'bg-green-500' : 'bg-gray-500'}`}
                title={isOnline(stats.lastBattleTime) ? 'En ligne' : 'Hors ligne'}
              />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-wot-goldLight flex items-center gap-2">
              {member.account_name}
              <a
                href={`https://tomato.gg/stats/EU/${member.account_name}=${member.account_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-wot-light/60 hover:text-wot-gold transition-colors"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </h3>
            <div className="flex items-center gap-4 text-sm text-wot-light/60">
              <span className="flex items-center">
                <Shield className="h-4 w-4 mr-1" strokeWidth={1.5} />
                {member.role_i18n}
              </span>
              <span className="flex items-center">
                <Timer className="h-4 w-4 mr-1" strokeWidth={1.5} />
                Depuis le {formatDate(member.joined_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex-1">
          {stats ? (
            <div className="text-center p-3 bg-wot-darker rounded-lg">
              <div className={`text-lg font-bold ${getActivityColor(stats.lastBattleTime)}`}>
                {formatLastActivity(stats.lastBattleTime)}
              </div>
              <div className="text-xs text-wot-light/60">Dernière activité</div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-3 bg-wot-darker rounded-lg text-wot-light/60">
              <AlertCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
              Activité indisponible
            </div>
          )}
        </div>

        {/* Discord Status & Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditDiscord(member.account_id)}
            className={`btn-secondary flex items-center ${
              member.discord_id ? 'border-green-500/30 text-green-400' : ''
            }`}
            title={member.discord_id ? 'Discord lié' : 'Discord non lié'}
          >
            <MessageCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
            {member.discord_id ? 'Discord lié' : 'Lier Discord'}
          </button>
        </div>
      </div>
    </div>
  );
}