import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApplicationsStore } from '../stores/applicationsStore';
import * as wotApi from '../services/wotApi';
import ErrorMessage from './recruitment/ErrorMessage';
import AvailabilitySelector from './recruitment/AvailabilitySelector';
import PlayerVerification from './recruitment/PlayerVerification';
import ClanSelector from './recruitment/ClanSelector';
import SuccessMessage from './recruitment/SuccessMessage';

const CLANS = [
  { id: "500191501", name: "ATFR" },
  { id: "500197997", name: "A-T-O" }
];

interface RecruitmentFormProps {
  onClose: () => void;
}

interface ApiError {
  message: string;
  type: 'error' | 'warning' | 'info';
}

export default function RecruitmentForm({ onClose }: RecruitmentFormProps) {
  const addApplication = useApplicationsStore(state => state.addApplication);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchingPlayer, setSearchingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [selectedClan, setSelectedClan] = useState(CLANS[0].id);
  const [availability, setAvailability] = useState('');
  const [error, setError] = useState<ApiError | null>(null);

  const verifyPlayer = async () => {
    if (!playerName.trim()) {
      setError({ message: 'Veuillez entrer un pseudo', type: 'warning' });
      return;
    }
    
    setSearchingPlayer(true);
    setError(null);
    
    try {
      const player = await wotApi.searchPlayer(playerName);
      setPlayerId(player.account_id);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Erreur lors de la recherche du joueur',
        type: 'error'
      });
      setPlayerId(null);
    } finally {
      setSearchingPlayer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!playerId) return;
    
    setSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await addApplication({
        playerName,
        discordTag: formData.get('discordTag') as string,
        availability,
        motivation: formData.get('motivation') as string,
        targetClan: CLANS.find(clan => clan.id === selectedClan)?.name || 'ATFR',
        wn8: '0',
        winRate: '0',
        battles: '0',
        tier10Count: '0',
        previousClans: 'Non vérifié'
      });
      setSubmitted(true);
    } catch (error) {
      setError({
        message: 'Erreur lors de l\'envoi de la candidature. Veuillez réessayer.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-wot-darker border border-wot-gold/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-wot-darker border-b border-wot-gold/20 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-wot-gold">Candidature ATFR</h2>
          <button
            onClick={onClose}
            className="text-wot-light/60 hover:text-wot-light"
          >
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <ErrorMessage
              message={error.message}
              type={error.type}
              onClose={() => setError(null)}
            />
          )}

          {submitted ? (
            <SuccessMessage onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <ClanSelector
                clans={CLANS}
                selectedClan={selectedClan}
                onClanChange={setSelectedClan}
                disabled={submitting}
              />

              <PlayerVerification
                playerName={playerName}
                onPlayerNameChange={setPlayerName}
                onVerify={verifyPlayer}
                isVerified={!!playerId}
                isSearching={searchingPlayer}
                disabled={submitting}
              />

              {playerId && (
                <div className="p-4 bg-wot-dark rounded-lg border border-wot-gold/20">
                  <a
                    href={`https://tomato.gg/stats/EU/${encodeURIComponent(playerName)}=${playerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wot-gold hover:text-wot-goldLight transition-colors"
                  >
                    Voir mon profil sur Tomato.gg
                  </a>
                </div>
              )}

              {playerId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-wot-light/80 mb-2">
                      Pseudo Discord *
                    </label>
                    <input
                      required
                      type="text"
                      name="discordTag"
                      minLength={2}
                      maxLength={32}
                      className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                               text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
                      placeholder="Votre pseudo Discord"
                      disabled={submitting}
                    />
                  </div>

                  <AvailabilitySelector
                    onChange={setAvailability}
                    disabled={submitting}
                  />

                  <div>
                    <label className="block text-sm font-medium text-wot-light/80 mb-2">
                      Informations complémentaires *
                    </label>
                    <textarea
                      required
                      name="motivation"
                      rows={4}
                      className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                               text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold
                               resize-none"
                      placeholder="Parlez-nous de votre expérience, vos objectifs, et pourquoi vous souhaitez rejoindre notre clan..."
                      disabled={submitting}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting || !availability}
                    >
                      {submitting ? 'Envoi...' : 'Envoyer ma candidature'}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}