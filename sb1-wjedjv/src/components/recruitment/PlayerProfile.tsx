import React from 'react';
import { ExternalLink } from 'lucide-react';

interface PlayerProfileProps {
  playerName: string;
  accountId: number;
}

export default function PlayerProfile({ playerName, accountId }: PlayerProfileProps) {
  const tomatoUrl = `https://tomato.gg/stats/EU/${encodeURIComponent(playerName)}=${accountId}`;
  
  return (
    <div className="flex items-center justify-between p-4 bg-wot-dark rounded-lg border border-wot-gold/20">
      <div>
        <h3 className="text-lg font-medium text-wot-goldLight">
          {playerName}
        </h3>
        <p className="text-sm text-wot-light/60">
          ID: {accountId}
        </p>
      </div>
      <a
        href={tomatoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex items-center gap-2"
      >
        <span>Voir profil</span>
        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
      </a>
    </div>
  );
}