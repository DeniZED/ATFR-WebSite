import React from 'react';

interface PlayerStatsProps {
  wn8: number;
  winRate: string;
  battles: number;
  tier10Count: number;
}

export default function PlayerStats({
  wn8,
  winRate,
  battles,
  tier10Count
}: PlayerStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-wot-dark p-4 rounded-lg border border-wot-gold/20">
        <span className="text-sm text-wot-light/60">WN8</span>
        <div className="text-xl font-bold text-wot-goldLight">
          {wn8.toFixed(0)}
        </div>
      </div>
      <div className="bg-wot-dark p-4 rounded-lg border border-wot-gold/20">
        <span className="text-sm text-wot-light/60">Winrate</span>
        <div className="text-xl font-bold text-wot-goldLight">
          {winRate}%
        </div>
      </div>
      <div className="bg-wot-dark p-4 rounded-lg border border-wot-gold/20">
        <span className="text-sm text-wot-light/60">Batailles</span>
        <div className="text-xl font-bold text-wot-goldLight">
          {battles.toLocaleString()}
        </div>
      </div>
      <div className="bg-wot-dark p-4 rounded-lg border border-wot-gold/20">
        <span className="text-sm text-wot-light/60">Chars Tier X</span>
        <div className="text-xl font-bold text-wot-goldLight">
          {tier10Count}
        </div>
      </div>
    </div>
  );
}