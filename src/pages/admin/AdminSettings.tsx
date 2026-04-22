import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Configuration
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Paramètres</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <Row label="Email" value={user?.email ?? '—'} />
          <Row label="User ID" value={user?.id ?? '—'} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environnement</CardTitle>
        </CardHeader>
        <CardBody className="space-y-2 text-sm">
          <Row label="Clan tag" value={env.clanTag} />
          <Row label="Clan ID" value={env.clanId} />
          <Row label="Supabase URL" value={env.supabaseUrl || '—'} />
          <Row
            label="WoT API"
            value={env.wotApplicationId ? 'Configurée' : 'Manquante'}
          />
          <Row
            label="Discord webhook"
            value="Géré côté serveur (Netlify Function)"
          />
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-atfr-gold/5 pb-2 last:border-b-0 last:pb-0">
      <span className="text-atfr-fog">{label}</span>
      <span className="text-atfr-bone font-mono text-xs truncate max-w-[60%] text-right">
        {value}
      </span>
    </div>
  );
}
