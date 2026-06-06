import { useMemo, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Badge, Button, Card, CardBody, Select, Spinner } from '@/components/ui';
import { useClanInfo } from '@/features/clan/queries';
import { useMembers, useMembersHistory } from '@/features/members/queries';
import { ROLE_PRIORITY, ROLE_TRANSLATIONS } from '@/lib/constants';
import { tomatoProfileUrl } from '@/lib/tomato-api';
import { supabase } from '@/lib/supabase';
import { formatDate, formatDateTime } from '@/features/rh/activity';
import type { Database } from '@/types/database';

type MemberRow = Database['public']['Tables']['members']['Row'];
type MemberInsert = Database['public']['Tables']['members']['Insert'];
type HistoryAction = 'joined' | 'left' | 'role_changed';
type HistoryFilter = 'all' | HistoryAction;

interface SyncResult {
  upserted: number;
  departed: number;
  rejoined: number;
}

function useSyncMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MemberInsert[]): Promise<SyncResult> => {
      const liveIds = new Set(payload.map((m) => m.account_id));

      // Fetch current DB state to detect departures and re-joins
      const { data: dbRows, error: fetchError } = await supabase
        .from('members')
        .select('account_id, left_at');
      if (fetchError) throw fetchError;

      const activeDbIds = new Set(
        (dbRows ?? []).filter((r) => r.left_at === null).map((r) => r.account_id),
      );
      const rejoinedIds = (dbRows ?? [])
        .filter((r) => r.left_at !== null && liveIds.has(r.account_id))
        .map((r) => r.account_id);
      const departedIds = [...activeDbIds].filter((id) => !liveIds.has(id));

      // Single batch upsert — includes left_at: null to handle re-joins in one shot
      if (payload.length > 0) {
        const { error } = await supabase
          .from('members')
          .upsert(payload, { onConflict: 'account_id' });
        if (error) throw error;
      }

      // Mark departures (active in DB but absent from live WoT roster)
      if (departedIds.length > 0) {
        const { error } = await supabase
          .from('members')
          .update({ left_at: new Date().toISOString() })
          .in('account_id', departedIds)
          .is('left_at', null);
        if (error) throw error;
      }

      return {
        upserted: payload.length,
        departed: departedIds.length,
        rejoined: rejoinedIds.length,
      };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

const ACTION_LABELS: Record<HistoryAction, string> = {
  joined: 'Entrée',
  left: 'Sortie',
  role_changed: 'Rôle modifié',
};

const ACTION_VARIANT: Record<HistoryAction, 'success' | 'danger' | 'outline'> = {
  joined: 'success',
  left: 'danger',
  role_changed: 'outline',
};

export default function AdminMembers() {
  const clan = useClanInfo();
  const members = useMembers({ activeOnly: false });
  const history = useMembersHistory();
  const sync = useSyncMembers();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');

  const activeMembers = useMemo(
    () => (members.data ?? []).filter((m) => m.left_at === null),
    [members.data],
  );
  const formerMembers = useMemo(
    () =>
      (members.data ?? [])
        .filter((m) => m.left_at !== null)
        .sort((a, b) => (b.left_at ?? '').localeCompare(a.left_at ?? '')),
    [members.data],
  );

  const filteredHistory = useMemo(() => {
    const rows = history.data ?? [];
    if (historyFilter === 'all') return rows;
    return rows.filter((e) => e.action === historyFilter);
  }, [history.data, historyFilter]);

  const sortedLive = useMemo(() => {
    if (!clan.data) return [];
    return [...clan.data.members].sort(
      (a, b) =>
        (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99) ||
        a.account_name.localeCompare(b.account_name),
    );
  }, [clan.data]);

  async function syncFromWoT() {
    if (!clan.data) return;
    // Pass the real WoT joined_at (Unix seconds → ISO) and left_at: null
    // so that re-joiners are handled atomically in the upsert
    const payload: MemberInsert[] = clan.data.members.map((m) => ({
      account_id: m.account_id,
      account_name: m.account_name,
      role: m.role,
      joined_at: new Date(m.joined_at * 1000).toISOString(),
      left_at: null,
    }));
    await sync.mutateAsync(payload);
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">Roster</p>
          <h1 className="font-display text-3xl text-atfr-bone">Membres</h1>
          <p className="text-sm text-atfr-fog mt-1">
            {activeMembers.length} actif(s) · {formerMembers.length} ancien(s) enregistré(s)
          </p>
        </div>
        <Button
          onClick={syncFromWoT}
          leadingIcon={<RefreshCcw size={14} />}
          disabled={!clan.data || sync.isPending}
        >
          {sync.isPending ? 'Sync…' : 'Sync WoT → Supabase'}
        </Button>
      </div>

      {sync.isSuccess && (
        <Alert tone="success">
          Sync terminée : {sync.data.upserted} membre(s) mis à jour
          {sync.data.rejoined > 0 ? `, ${sync.data.rejoined} retour(s)` : ''}
          {sync.data.departed > 0 ? `, ${sync.data.departed} départ(s) enregistré(s)` : ''}.
        </Alert>
      )}
      {sync.isError && (
        <Alert tone="danger">{(sync.error as Error).message}</Alert>
      )}

      {/* ── Roster actuel (live WoT) ── */}
      <section>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
          Membres actuels — {sortedLive.length} joueur(s)
        </p>
        {clan.isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Chargement du clan…" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sortedLive.map((m) => (
              <Card key={m.account_id}>
                <CardBody className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 flex items-center justify-center text-atfr-gold font-display text-sm shrink-0">
                    {m.account_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={tomatoProfileUrl(m.account_name)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-atfr-bone hover:text-atfr-gold truncate block"
                    >
                      {m.account_name}
                    </a>
                    <Badge variant="outline" className="mt-1">
                      {ROLE_TRANSLATIONS[m.role] ?? m.role_i18n}
                    </Badge>
                    <p className="text-[10px] text-atfr-fog mt-1">
                      Membre depuis le {formatDate(new Date(m.joined_at * 1000).toISOString())}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Ex-membres ── */}
      {formerMembers.length > 0 && (
        <section>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
            Anciens membres — {formerMembers.length} joueur(s)
          </p>
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-atfr-gold/10 bg-atfr-ink/70 text-xs uppercase tracking-wider text-atfr-fog">
                    <tr>
                      <Th>Joueur</Th>
                      <Th>Rôle</Th>
                      <Th>Entrée</Th>
                      <Th>Sortie</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-atfr-gold/10">
                    {formerMembers.map((m) => (
                      <FormerMemberRow key={m.account_id} member={m} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </section>
      )}

      {/* ── Historique ── */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
            Historique arrivées / départs / rôles
          </p>
          <Select
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value as HistoryFilter)}
            className="min-w-36"
          >
            <option value="all">Tous</option>
            <option value="joined">Entrées</option>
            <option value="left">Sorties</option>
            <option value="role_changed">Rôles</option>
          </Select>
        </div>

        {history.isLoading ? (
          <Spinner label="Chargement…" />
        ) : filteredHistory.length === 0 ? (
          <p className="text-sm text-atfr-fog">
            {(history.data ?? []).length === 0
              ? 'Aucun événement enregistré. Lance une sync pour initialiser.'
              : 'Aucun événement pour ce filtre.'}
          </p>
        ) : (
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-atfr-gold/10 bg-atfr-ink/70 text-xs uppercase tracking-wider text-atfr-fog">
                    <tr>
                      <Th>Date</Th>
                      <Th>Joueur</Th>
                      <Th>Événement</Th>
                      <Th>Rôle</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-atfr-gold/10">
                    {filteredHistory.map((event) => (
                      <tr key={event.id} className="hover:bg-atfr-graphite/30 transition-colors">
                        <td className="px-4 py-3 text-atfr-fog whitespace-nowrap">
                          {formatDateTime(event.occurred_at)}
                        </td>
                        <td className="px-4 py-3 font-medium text-atfr-bone">
                          <a
                            href={tomatoProfileUrl(event.account_name)}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-atfr-gold"
                          >
                            {event.account_name}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={ACTION_VARIANT[event.action as HistoryAction]}>
                            {ACTION_LABELS[event.action as HistoryAction] ?? event.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-atfr-fog text-xs">
                          {event.action === 'role_changed'
                            ? `${roleLabel(event.previous_role)} → ${roleLabel(event.new_role)}`
                            : event.action === 'joined'
                              ? roleLabel(event.new_role)
                              : roleLabel(event.previous_role)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </section>
    </div>
  );
}

function FormerMemberRow({ member }: { member: MemberRow }) {
  return (
    <tr className="hover:bg-atfr-graphite/30 transition-colors">
      <td className="px-4 py-3 font-medium text-atfr-bone">
        <a
          href={tomatoProfileUrl(member.account_name)}
          target="_blank"
          rel="noreferrer"
          className="hover:text-atfr-gold"
        >
          {member.account_name}
        </a>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline">
          {ROLE_TRANSLATIONS[member.role] ?? member.role}
        </Badge>
      </td>
      <td className="px-4 py-3 text-atfr-fog text-xs whitespace-nowrap">
        {formatDate(member.joined_at)}
      </td>
      <td className="px-4 py-3 text-atfr-fog text-xs whitespace-nowrap">
        {formatDate(member.left_at ?? '')}
      </td>
    </tr>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}

function roleLabel(role: string | null | undefined): string {
  if (!role) return '—';
  return ROLE_TRANSLATIONS[role] ?? role;
}
