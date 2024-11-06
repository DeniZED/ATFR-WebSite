import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, SortAsc, MessageCircle } from 'lucide-react';
import { ClanMember, PlayerStats, MemberStats, SortConfig } from './types';
import MemberCard from './MemberCard';
import { fetchClanMembers, fetchPlayerStats } from './api';

export default function Members() {
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStats>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ 
    key: 'account_name', 
    direction: 'asc' 
  });
  const [filterDiscord, setFilterDiscord] = useState<'all' | 'linked' | 'unlinked'>('all');

  const loadMembers = async () => {
    try {
      setRefreshing(true);
      const result = await fetchClanMembers();
      
      if (result.success) {
        setMembers(result.data);
        const statsResult = await fetchPlayerStats(result.data.map(m => m.account_id));
        if (statsResult.success) {
          setMemberStats(statsResult.data);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur inattendue lors du chargement des données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleEditDiscord = (memberId: number) => {
    const member = members.find(m => m.account_id === memberId);
    if (!member) return;

    const newDiscordId = prompt(
      'Entrez l\'ID Discord du joueur:',
      member.discord_id || ''
    );

    if (newDiscordId !== null) {
      setMembers(members.map(m => 
        m.account_id === memberId 
          ? { ...m, discord_id: newDiscordId || undefined }
          : m
      ));
    }
  };

  const sortMembers = (a: ClanMember, b: ClanMember) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === 'discord_id') {
      const aHasDiscord = Boolean(a.discord_id);
      const bHasDiscord = Boolean(b.discord_id);
      comparison = Number(bHasDiscord) - Number(aHasDiscord);
    } else {
      comparison = String(a[key]).localeCompare(String(b[key]));
    }

    return direction === 'asc' ? comparison : -comparison;
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredMembers = members
    .filter(member => 
      member.account_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDiscord === 'all' ||
       (filterDiscord === 'linked' && member.discord_id) ||
       (filterDiscord === 'unlinked' && !member.discord_id))
    )
    .sort(sortMembers);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-wot-gold animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-wot-gold">Membres du Clan</h1>
        <button
          onClick={loadMembers}
          className="btn-secondary flex items-center"
          disabled={refreshing}
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
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

        <div className="flex gap-2">
          <button
            onClick={() => handleSort('account_name')}
            className={`btn-secondary flex items-center ${
              sortConfig.key === 'account_name' ? 'text-wot-gold' : ''
            }`}
          >
            <SortAsc className="h-5 w-5 mr-2" strokeWidth={1.5} />
            Nom
          </button>
          <button
            onClick={() => handleSort('role_i18n')}
            className={`btn-secondary flex items-center ${
              sortConfig.key === 'role_i18n' ? 'text-wot-gold' : ''
            }`}
          >
            <SortAsc className="h-5 w-5 mr-2" strokeWidth={1.5} />
            Grade
          </button>
          <button
            onClick={() => handleSort('discord_id')}
            className={`btn-secondary flex items-center ${
              sortConfig.key === 'discord_id' ? 'text-wot-gold' : ''
            }`}
          >
            <MessageCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
            Discord
          </button>
        </div>

        <select
          value={filterDiscord}
          onChange={(e) => setFilterDiscord(e.target.value as typeof filterDiscord)}
          className="px-3 py-2 bg-wot-darker border border-wot-gold/20 rounded-lg
                   text-wot-light focus:outline-none focus:border-wot-gold"
        >
          <option value="all">Tous les membres</option>
          <option value="linked">Discord lié</option>
          <option value="unlinked">Discord non lié</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.account_id}
            member={member}
            stats={memberStats[member.account_id]}
            onEditDiscord={handleEditDiscord}
          />
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center text-wot-light/60 py-8">
            Aucun membre trouvé
          </div>
        )}
      </div>
    </div>
  );
}