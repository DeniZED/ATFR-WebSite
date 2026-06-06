import { useMemo } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, CardBody, Spinner } from '@/components/ui';
import { useClanInfo } from '@/features/clan/queries';
import { useMembers, useMembersHistory } from '@/features/members/queries';
import { ROLE_PRIORITY, ROLE_TRANSLATIONS } from '@/lib/constants';
import { tomatoProfileUrl } from '@/lib/tomato-api';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/features/rh/activity';
import type { Database } from '@/types/database';

type MemberInsert = Database['public']['Tables']['members']['Insert'];

function useSyncMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      liveIds,
      liveMembers,
      activeDbIds,
    }: {
      liveIds: Set<number>;
      liveMembers: MemberInsert[];
      activeDbIds: Set<number>;
    }) => {
      // 1. Batch-upsert all current WoT members
      if (liveMembers.length > 0) {
        const { error } = await supabase.from('members').upsert(liveMembers, {
          onConflict: 'account_id',
        });
        if (error) throw error;
      }

      // 2. Mark departed members (active in DB but absent from WoT roster)
      const departed = [...activeDbIds].filter((id) => !liveIds.has(id));
      if (departed.length > 0) {
        const { error } = await supabase
          .from('members')
          .update({ left_at: new Date().toISOString() })
          .in('account_id', departed)
          .is('left_at', null);
        if (error) throw error;
      }

      return { upserted: liveMembers.length, departed: departed.length };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

const ACTION_LABELS: Record<string, string> = {
  joined: 'Entrée',
  left: 'Sortie',
  role_changed: 'Rôle modifié',
};

export default function AdminMembers() {
  const clan = useClanInfo();
  const members = useMembers({ activeOnly: false });
  const history = useMembersHistory();
  const sync = useSyncMembers();

  const activeDbIds = useMemo(
    () =>
      new Set(
        (members.data ?? [])
          .filter((m) => m.left_at === null)
          .map((m) => m.account_id),
      ),
    [members.data],
  );

  async function syncFromWoT() {
    if (!clan.data) return;
    const liveMembers: MemberInsert[] = clan.data.members.map((m) => ({
      account_id: m.account_id,
      account_name: m.account_name,
      role: m.role,
    }));
    const liveIds = new Set(liveMembers.map((m) => m.account_id as number));
    await sync.mutateAsync({ liveIds, liveMembers, activeDbIds });
  }

  const sorted = useMemo(() => {
    if (!clan.data) return [];
    return [...clan.data.members].sort(
      (a, b) =>
        (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99) ||
        a.account_name.localeCompare(b.account_name),
    );
  }, [clan.data]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Roster
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Membres</h1>
          <p className="text-sm text-atfr-fog mt-1">
            Données live depuis l'API WoT · {members.data?.filter((m) => m.left_at === null).length ?? 0} actifs dans Supabase.
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
        <p className="text-sm text-atfr-success">
          Sync terminée : {sync.data.upserted} membre(s) mis à jour
          {sync.data.departed > 0
            ? `, ${sync.data.departed} départ(s) enregistré(s).`
            : '.'}
        </p>
      )}
      {sync.isError && (
        <p className="text-sm text-atfr-danger">{(sync.error as Error).message}</p>
      )}

      {clan.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Chargement du clan…" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <Card key={m.account_id}>
              <CardBody className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 flex items-center justify-center text-atfr-gold font-display text-sm">
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
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-3">
          Historique arrivées / départs
        </p>
        {history.isLoading ? (
          <Spinner label="Chargement…" />
        ) : (history.data ?? []).length === 0 ? (
          <p className="text-sm text-atfr-fog">
            Aucun événement enregistré. Lance une sync pour initialiser l'historique.
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
                    {(history.data ?? []).map((event) => (
                      <tr key={event.id} className="hover:bg-atfr-graphite/30 transition-colors">
                        <td className="px-4 py-3 text-atfr-fog whitespace-nowrap">
                          {formatDateTime(event.occurred_at)}
                        </td>
                        <td className="px-4 py-3 text-atfr-bone font-medium">
                          {event.account_name}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              event.action === 'joined'
                                ? 'success'
                                : event.action === 'left'
                                  ? 'danger'
                                  : 'outline'
                            }
                          >
                            {ACTION_LABELS[event.action] ?? event.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-atfr-fog text-xs">
                          {event.action === 'role_changed'
                            ? `${ROLE_TRANSLATIONS[event.previous_role ?? ''] ?? event.previous_role ?? '—'} → ${ROLE_TRANSLATIONS[event.new_role ?? ''] ?? event.new_role ?? '—'}`
                            : event.action === 'joined'
                              ? (ROLE_TRANSLATIONS[event.new_role ?? ''] ?? event.new_role ?? '—')
                              : (ROLE_TRANSLATIONS[event.previous_role ?? ''] ?? event.previous_role ?? '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left font-medium">{children}</th>;
}
