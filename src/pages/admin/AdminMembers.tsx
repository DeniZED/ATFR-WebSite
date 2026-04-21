import { useMemo } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Badge, Button, Card, CardBody, Spinner } from '@/components/ui';
import { useClanInfo } from '@/features/clan/queries';
import { useMembers, useUpsertMember } from '@/features/members/queries';
import { ROLE_PRIORITY, ROLE_TRANSLATIONS } from '@/lib/constants';
import { tomatoProfileUrl } from '@/lib/tomato-api';

export default function AdminMembers() {
  const clan = useClanInfo();
  const members = useMembers({ activeOnly: false });
  const upsert = useUpsertMember();

  async function syncFromWoT() {
    if (!clan.data) return;
    for (const m of clan.data.members) {
      await upsert.mutateAsync({
        account_id: m.account_id,
        account_name: m.account_name,
        role: m.role,
      });
    }
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
            Données live depuis l'API WoT · {members.data?.length ?? 0} synchronisés dans Supabase.
          </p>
        </div>
        <Button
          onClick={syncFromWoT}
          leadingIcon={<RefreshCcw size={14} />}
          disabled={!clan.data || upsert.isPending}
        >
          {upsert.isPending ? 'Sync…' : 'Sync WoT → Supabase'}
        </Button>
      </div>

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
    </div>
  );
}
