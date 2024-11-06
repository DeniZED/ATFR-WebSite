import React from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-wot-gold">Paramètres du Clan</h1>

      <div className="card p-6">
        <form className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-wot-goldLight">
              Informations Générales
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-wot-light/80 mb-2">
                Description du Clan
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none 
                         focus:border-wot-gold resize-none"
                placeholder="Description du clan..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-wot-light/80 mb-2">
                Discord Invite Link
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                         text-wot-light placeholder-wot-light/50 focus:outline-none 
                         focus:border-wot-gold"
                placeholder="https://discord.gg/..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-wot-goldLight">
              Critères de Recrutement
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-wot-light/80 mb-2">
                  WN8 Minimum
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none 
                           focus:border-wot-gold"
                  placeholder="2000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-wot-light/80 mb-2">
                  Winrate Minimum
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-wot-dark border border-wot-gold/20 rounded-lg
                           text-wot-light placeholder-wot-light/50 focus:outline-none 
                           focus:border-wot-gold"
                  placeholder="52"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-wot-gold/20">
            <button
              type="submit"
              className="btn-primary flex items-center"
            >
              <Save className="h-5 w-5 mr-2" strokeWidth={1.5} />
              Sauvegarder les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}