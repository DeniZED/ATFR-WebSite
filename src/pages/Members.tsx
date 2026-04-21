import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Card, CardBody, Input, Section, Spinner } from '@/components/ui';
import { useClanInfo } from '@/features/clan/queries';
import { ROLE_PRIORITY, ROLE_TRANSLATIONS } from '@/lib/constants';
import { tomatoProfileUrl } from '@/lib/tomato-api';

export default function Members() {
  const { data: clan, isLoading, error } = useClanInfo();
  const [search, setSearch] = useState('');

  const members = useMemo(() => {
    if (!clan?.members) return [];
    return [...clan.members]
      .filter((m) =>
        m.account_name.toLowerCase().includes(search.toLowerCase()),
      )
      .sort(
        (a, b) =>
          (ROLE_PRIORITY[a.role] ?? 99) - (ROLE_PRIORITY[b.role] ?? 99) ||
          a.account_name.localeCompare(b.account_name),
      );
  }, [clan, search]);

  return (
    <Section
      eyebrow="Roster"
      title="Nos membres"
      description="Liste synchronisée depuis l'API Wargaming. Cliquez sur un joueur pour ouvrir son profil tomato.gg."
    >
      <div className="mb-8 max-w-sm mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-atfr-fog"
            size={18}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur…"
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Chargement du roster…" />
        </div>
      ) : error ? (
        <p className="text-center text-atfr-danger">Impossible de charger les membres.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <a
              key={m.account_id}
              href={tomatoProfileUrl(m.account_name)}
              target="_blank"
              rel="noreferrer"
            >
              <Card className="hover:-translate-y-0.5 transition-transform">
                <CardBody className="flex items-center gap-4 p-4">
                  <div className="h-11 w-11 rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 flex items-center justify-center text-atfr-gold font-display">
                    {m.account_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-atfr-bone truncate">
                      {m.account_name}
                    </p>
                    <Badge variant="gold" className="mt-1">
                      {ROLE_TRANSLATIONS[m.role] ?? m.role_i18n}
                    </Badge>
                  </div>
                </CardBody>
              </Card>
            </a>
          ))}
          {members.length === 0 && (
            <p className="col-span-full text-center text-atfr-fog py-10">
              Aucun membre ne correspond.
            </p>
          )}
        </div>
      )}
    </Section>
  );
}
