import React from 'react';
import { Search, CheckCircle, Loader2 } from 'lucide-react';

interface PlayerVerificationProps {
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onVerify: () => void;
  isVerified: boolean;
  isSearching: boolean;
  disabled?: boolean;
}

export default function PlayerVerification({
  playerName,
  onPlayerNameChange,
  onVerify,
  isVerified,
  isSearching,
  disabled
}: PlayerVerificationProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-wot-light/80 mb-2">
        Pseudo en jeu *
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                   text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
          disabled={isVerified || disabled}
          placeholder="Entrez votre pseudo exact"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={isSearching || isVerified || disabled}
          className="btn-secondary flex items-center gap-2 min-w-[100px] justify-center"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
          ) : isVerified ? (
            <CheckCircle className="h-5 w-5 text-green-400" strokeWidth={1.5} />
          ) : (
            <Search className="h-5 w-5" strokeWidth={1.5} />
          )}
          {isVerified ? 'Vérifié' : 'Vérifier'}
        </button>
      </div>
    </div>
  );
}