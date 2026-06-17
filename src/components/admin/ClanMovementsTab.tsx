import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardBody, Input, Select, Spinner } from '@/components/ui';
import { PlayerLookupCard } from '@/components/recruitment/PlayerLookupCard';
import {
  useClanMovements,
  useCreateProspectFromMovement,
  useUpdateMovementContactStatus,
} from '@/features/clanMovements/queries';
import { usePlayerLookup } from '@/features/stats/queries';
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
  const updateContact = useUpdateMovementContactStatus();
  const createProspect = useCreateProspectFromMovement();
  const [eventFilter, setEventFilter] = useState<EventFilter>('leave');
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all');
  const [clanFilter, setClanFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clanOptions = useMemo(() => {
    const values = new Set<string>();
    for (const movement of movements.data ?? []) {
      if (movement.clan_tag) values.add(movement.clan_tag);
    }
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [movements.data]);

  const filtered = useMemo(() => {
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
          </div>
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
                    <th className="px-4 py-3 text-left font-medium">Suivi</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-atfr-gold/10">
                  {filtered.map((movement) => (
                    <MovementRow
                      key={movement.id}
                      movement={movement}
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
  linkedPlayerNickname,
  expanded,
  onToggleExpand,
  onSetContactStatus,
  onAddProspect,
  addingProspect,
}: {
  movement: ClanMemberMovementRow;
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
          <td colSpan={6} className="px-4 py-4 bg-atfr-ink/40">
            <PlayerLookupCard loading={lookup.isLoading} data={lookup.data} error={lookup.error} />
          </td>
        </tr>
      )}
    </>
  );
}
