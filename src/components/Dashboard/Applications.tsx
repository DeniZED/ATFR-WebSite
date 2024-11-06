import React, { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useApplicationsStore, Application } from '../../stores/applicationsStore';

export default function Applications() {
  const { applications, updateStatus, deleteApplication, initialize, initialized } = useApplicationsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleUpdateStatus = async (id: string, status: Application['status']) => {
    if (window.confirm(`Êtes-vous sûr de vouloir ${status === 'accepted' ? 'accepter' : 'refuser'} cette candidature ?`)) {
      setLoading(true);
      try {
        await updateStatus(id, status);
      } catch (error) {
        alert('Erreur lors de la mise à jour du statut');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      setLoading(true);
      try {
        await deleteApplication(id);
      } catch (error) {
        alert('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'accepted': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-wot-gold animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-wot-gold">Candidatures</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            className="w-full pl-10 pr-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                     text-wot-light placeholder-wot-light/50 focus:outline-none focus:border-wot-gold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-wot-light/50" strokeWidth={1.5} />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light focus:outline-none focus:border-wot-gold"
        >
          <option value="all">Toutes les candidatures</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptées</option>
          <option value="rejected">Refusées</option>
        </select>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 text-wot-gold animate-spin" strokeWidth={1.5} />
        </div>
      )}

      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="card p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Info principale */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-wot-goldLight flex items-center gap-2">
                      {application.playerName}
                      <a
                        href={`https://tomato.gg/stats/EU/${application.playerName}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-wot-light/60 hover:text-wot-gold transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                      </a>
                    </h3>
                    <p className="text-sm text-wot-light/60">
                      Candidature reçue le {new Date(application.timestamp).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(application.status)}`}>
                    {application.status === 'pending' ? 'En attente' :
                     application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-wot-darker p-3 rounded">
                    <div className="text-sm text-wot-light/60">WN8</div>
                    <div className="text-wot-goldLight font-bold">{application.wn8}</div>
                  </div>
                  <div className="bg-wot-darker p-3 rounded">
                    <div className="text-sm text-wot-light/60">Winrate</div>
                    <div className="text-wot-goldLight font-bold">{application.winRate}</div>
                  </div>
                  <div className="bg-wot-darker p-3 rounded">
                    <div className="text-sm text-wot-light/60">Batailles</div>
                    <div className="text-wot-goldLight font-bold">{application.battles}</div>
                  </div>
                  <div className="bg-wot-darker p-3 rounded">
                    <div className="text-sm text-wot-light/60">Chars Tier X</div>
                    <div className="text-wot-goldLight font-bold">{application.tier10Count}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-wot-light/60">Discord:</span>
                    <span className="ml-2 text-wot-light">{application.discordTag}</span>
                  </div>
                  <div>
                    <span className="text-wot-light/60">Disponibilités:</span>
                    <span className="ml-2 text-wot-light">{application.availability}</span>
                  </div>
                </div>

                {application.previousClans && (
                  <div>
                    <h4 className="text-sm font-medium text-wot-light/60 mb-1">Clans précédents</h4>
                    <p className="text-wot-light">{application.previousClans}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-wot-light/60 mb-1">Motivation</h4>
                  <p className="text-wot-light">{application.motivation}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-end gap-2">
                {application.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(application.id, 'accepted')}
                      className="btn-secondary border-green-500/30 text-green-400 
                               hover:border-green-500/50 hover:text-green-300"
                      disabled={loading}
                    >
                      <CheckCircle className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(application.id, 'rejected')}
                      className="btn-secondary border-red-500/30 text-red-400
                               hover:border-red-500/50 hover:text-red-300"
                      disabled={loading}
                    >
                      <XCircle className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(application.id)}
                  className="btn-secondary border-red-500/30 text-red-400
                           hover:border-red-500/50 hover:text-red-300"
                  disabled={loading}
                >
                  <Trash2 className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredApplications.length === 0 && (
          <div className="text-center text-wot-light/60 py-8">
            Aucune candidature trouvée
          </div>
        )}
      </div>
    </div>
  );
}