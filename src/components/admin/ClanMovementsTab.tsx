import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardBody, Input, Select, Spinner } from '@/components/ui';
import { PlayerLookupCard } from '@/components/recruitment/PlayerLookupCard';
import {
  useClanMovements,
  useCreateProspectFromMovement,
  useUpdateMovementContactStatus,
} from '@/features/clanMovements/queries';
import { useMovementsStatsBatch, usePlayerLookup } from '@/features/stats/queries';
import { useRecruitmentSettings } from '@/features/recruitment/settings';
import { wn8Color, type PlayerExtendedStats } from '@/lib/tomato-api';
import type { ClanMemberMovementRow, ClanMovementContactStatus } from '@/types/database';

type EventFilter = 'all' | 'join' | 'leave';
type ContactFilter = 'all' | ClanMovementContactStatus;

const CONTACT_LABELS: Record<ClanMovementContactStatus, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  linked: 'Lié à un profil RH',
  ignored: 'Ignoré',
};

const CONTACT_BADGE: Record<ClanMovementContactStatus, 'neutral' | 'gold' | 'success' | 'outline'> = {
  new: 'neutral',
  contacted: 'gold',
  linked: 'success',
  ignored: 'outline',
};

export function ClanMovementsTab({
  playerNicknamesById,
}: {
  playerNicknamesById: Map<string, string>;
}) {
  const navigate = useNavigate();
  const movements = useClanMovements();
  const recruitmentSettings = useRecruitmentSettings();
  const updateContact = useUpdateMovementContactStatus();
  const createProspect = useCreateProspectFromMovement();
  const [eventFilter, setEventFilter] = useState<EventFilter>('leave');
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all');
  const [clanFilter, setClanFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [minWn8, setMinWn8] = useState('');
  const [minWn8Touched, setMinWn8Touched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Pré-remplit le filtre avec le seuil configuré dans Réglages admin (source
  // unique partagée avec le score de recrutement et les embeds Discord), sauf
  // si l'utilisateur a déjà modifié le champ.
  useEffect(() => {
    if (minWn8Touched) return;
    const configured = recruitmentSettings.data?.min_wn8;
    if (configured) setMinWn8(String(configured));
  }, [recruitmentSettings.data, minWn8Touched]);

  const clanOptions = useMemo(() => {
    const values = new Set<string>();
    for (const movement of movements.data ?? []) {
      if (movement.clan_tag) values.add(movement.clan_tag);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [movements.data]);

  const baseFiltered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (movements.data ?? []).filter((movement) => {
      const matchesEvent = eventFilter === 'all' || movement.event === eventFilter;
      const matchesContact =
        contactFilter === 'all' || movement.contact_status === contactFilter;
      const matchesClan = clanFilter === 'all' || movement.clan_tag === clanFilter;
      const matchesSearch =
        !query || movement.account_name.toLowerCase().includes(query);
      return matchesEvent && matchesContact && matchesClan && matchesSearch;
    });
  }, [movements.data, eventFilter, contactFilter, clanFilter, search]);

  // Stats WN8/score chargées en masse pour les 50 premiers résultats — au-delà,
  // le filtre WN8 ne s'applique pas (évite de spammer l'API tomato.gg/WG).
  const STATS_BATCH_LIMIT = 50;
  const statsTargets = useMemo(() => baseFiltered.slice(0, STATS_BATCH_LIMIT), [baseFiltered]);
  const statsBatch = useMovementsStatsBatch(statsTargets);
  const minWn8Value = minWn8.trim() ? Number(minWn8) : null;

  const filtered = useMemo(() => {
    if (minWn8Value == null || !Number.isFinite(minWn8Value)) return baseFiltered;
    return baseFiltered.filter((movement) => {
      const stats = statsBatch.data?.get(movement.account_id);
      return stats?.wn8 != null && stats.wn8 >= minWn8Value;
    });
  }, [baseFiltered, minWn8Value, statsBatch.data]);

  async function handleAddProspect(movement: ClanMemberMovementRow) {
    try {
      const player = await createProspect.mutateAsync(movement);
      navigate(`/admin/rh/${player.id}`);
    } catch {
      /* surfaced by mutation state */
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardBody className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <Input
              label="Recherche"
              placeholder="Pseudo joueur"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              label="Mouvement"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value as EventFilter)}
            >
              <option value="leave">Sorties</option>
              <option value="join">Entrées</option>
              <option value="all">Tous</option>
            </Select>
            <Select
              label="Clan"
              value={clanFilter}
              onChange={(e) => setClanFilter(e.target.value)}
            >
              <option value="all">Tous</option>
              {clanOptions.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
            <Select
              label="Suivi recrutement"
              value={contactFilter}
              onChange={(e) => setContactFilter(e.target.value as ContactFilter)}
            >
              <option value="all">Tous</option>
              {Object.entries(CONTACT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Input
              type="number"
              label="WN8 minimum"
              placeholder="Ex. 1250"
              value={minWn8}
              onChange={(e) => {
                setMinWn8Touched(true);
                setMinWn8(e.target.value);
              }}
              hint={
                statsBatch.isFetching
                  ? 'Chargement des stats…'
                  : !minWn8Touched && recruitmentSettings.data?.min_wn8
                    ? 'Valeur par défaut depuis Réglages admin'
                    : undefined
              }
            />
          </div>
          {minWn8Value != null && baseFiltered.length > STATS_BATCH_LIMIT && (
            <Alert tone="warning">
              Le filtre WN8 ne s'applique qu'aux {STATS_BATCH_LIMIT} premiers résultats
              ({baseFiltered.length} au total) — affinez les autres filtres pour réduire la liste.
            </Alert>
          )}
        </CardBody>
      </Card>

      {updateContact.isError && (
        <Alert tone="danger">{(updateContact.error as Error).message}</Alert>
      )}
      {createProspect.isError && (
        <Alert tone="danger">{(createProspect.error as Error).message}</Alert>
      )}

      {movements.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Chargement des mouvements…" />
        </div>
      ) : movements.isError ? (
        <Alert tone="danger">{(movements.error as Error).message}</Alert>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="p-10 text-center text-atfr-fog">
            Aucun mouvement ne correspond aux filtres actuels.
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-atfr-gold/10 bg-atfr-ink/70 text-xs uppercase tracking-wider text-atfr-fog">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Joueur</th>
                    <th className="px-4 py-3 text-left font-medium">Clan</th>
                    <th className="px-4 py-3 text-left font-medium">Mouvement</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Score</th>
                    <th className="px-4 py-3 text-left font-medium">Suivi</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atfr-gold/10">
                  {filtered.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
                      stats={statsBatch.data?.get(movement.account_id) ?? null}
                      linkedPlayerNickname={
                        movement.linked_player_id
                          ? playerNicknamesById.get(movement.linked_player_id) ?? null
                          : null
                      }
                      expanded={expandedId === movement.id}
                      onToggleExpand={() =>
                        setExpandedId(expandedId === movement.id ? null : movement.id)
                      }
                      onSetContactStatus={(status) =>
                        updateContact.mutate({ movementId: movement.id, contactStatus: status })
                      }
                      onAddProspect={() => handleAddProspect(movement)}
                      addingProspect={createProspect.isPending}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function MovementRow({
  movement,
  stats,
  linkedPlayerNickname,
  expanded,
  onToggleExpand,
  onSetContactStatus,
  onAddProspect,
  addingProspect,
}: {
  movement: ClanMemberMovementRow;
  stats: PlayerExtendedStats | null;
  linkedPlayerNickname: string | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onSetContactStatus: (status: ClanMovementContactStatus) => void;
  onAddProspect: () => void;
  addingProspect: boolean;
}) {
  const lookup = usePlayerLookup(movement.account_name, expanded);

  return (
    <>
      <tr className="align-top hover:bg-atfr-graphite/30 transition-colors">
        <td className="px-4 py-4">
          <p className="font-medium text-atfr-bone">{movement.account_name}</p>
          <p className="text-xs text-atfr-fog">WoT {movement.account_id}</p>
        </td>
        <td className="px-4 py-4">
          <Badge variant="outline">{movement.clan_tag ?? `#${movement.clan_id}`}</Badge>
        </td>
        <td className="px-4 py-4">
          <Badge variant={movement.event === 'join' ? 'success' : 'danger'}>
            {movement.event === 'join' ? '🟢 Entrée' : '🔴 Sortie'}
          </Badge>
        </td>
        <td className="px-4 py-4 text-atfr-fog">
          {new Date(movement.occurred_at).toLocaleString('fr-FR')}
        </td>
        <td className="px-4 py-4">
          {stats?.recruitmentScore != null ? (
            <span className={`font-display text-lg ${wn8Color(stats.wn8)}`}>
              {stats.recruitmentScore}
            </span>
          ) : (
            <span className="text-atfr-fog">—</span>
          )}
        </td>
        <td className="px-4 py-4">
          <Select
            value={movement.contact_status}
            onChange={(e) => onSetContactStatus(e.target.value as ClanMovementContactStatus)}
          >
            {Object.entries(CONTACT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Badge variant={CONTACT_BADGE[movement.contact_status]} className="mt-1">
            {CONTACT_LABELS[movement.contact_status]}
          </Badge>
        </td>
        <td className="px-4 py-4 space-x-2 whitespace-nowrap">
          <Button onClick={onToggleExpand}>{expanded ? 'Masquer stats' : 'Voir stats'}</Button>
          {movement.linked_player_id ? (
            <Link
              to={`/admin/rh/${movement.linked_player_id}`}
              className="inline-flex items-center justify-center rounded-md border border-atfr-gold/30 px-3 py-1.5 text-xs font-medium text-atfr-gold transition-colors hover:bg-atfr-gold/10"
            >
              Profil RH{linkedPlayerNickname ? ` (${linkedPlayerNickname})` : ''}
            </Link>
          ) : (
            <Button onClick={onAddProspect} disabled={addingProspect}>
              {addingProspect ? 'Ajout…' : 'Ajouter comme prospect'}
            </Button>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-atfr-ink/40">
            <PlayerLookupCard loading={lookup.isLoading} data={lookup.data} error={lookup.error} />
          </td>
        </tr>
      )}
    </>
  );
}
