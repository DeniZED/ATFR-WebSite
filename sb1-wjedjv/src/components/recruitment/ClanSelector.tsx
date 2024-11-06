import React from 'react';

interface Clan {
  id: string;
  name: string;
}

interface ClanSelectorProps {
  clans: Clan[];
  selectedClan: string;
  onClanChange: (clanId: string) => void;
  disabled?: boolean;
}

export default function ClanSelector({
  clans,
  selectedClan,
  onClanChange,
  disabled
}: ClanSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-wot-light/80 mb-2">
        Clan souhaité *
      </label>
      <select
        value={selectedClan}
        onChange={(e) => onClanChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                 text-wot-light focus:outline-none focus:border-wot-gold"
      >
        {clans.map(clan => (
          <option key={clan.id} value={clan.id}>{clan.name}</option>
        ))}
      </select>
    </div>
  );
}