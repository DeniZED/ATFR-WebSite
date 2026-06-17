import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardHeader, CardTitle, Input, Spinner } from '@/components/ui';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { ROLE_LABELS } from '@/types/database';
import {
  useRecruitmentSettings,
  useUpdateRecruitmentSettings,
  type RecruitmentSettingsPatch,
} from '@/features/recruitment/settings';

export default function AdminSettings() {
  const { user } = useAuth();
  const { role } = useRole();

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
          <Row label="Rôle" value={role ? ROLE_LABELS[role] : 'Aucun'} />
          <Row label="User ID" value={user?.id ?? '—'} />
        </CardBody>
      </Card>

      <RecruitmentSettingsCard />

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

function RecruitmentSettingsCard() {
  const settings = useRecruitmentSettings();
  const update = useUpdateRecruitmentSettings();
  const [form, setForm] = useState<RecruitmentSettingsPatch | null>(null);

  useEffect(() => {
    if (settings.data && !form) {
      setForm({
        min_wn8: settings.data.min_wn8,
        min_battles: settings.data.min_battles,
        weight_wn8: settings.data.weight_wn8,
        weight_winrate: settings.data.weight_winrate,
        weight_battles: settings.data.weight_battles,
        weight_tier10: settings.data.weight_tier10,
      });
    }
  }, [settings.data, form]);

  function setField(key: keyof RecruitmentSettingsPatch, value: string) {
    const num = Number(value);
    setForm((prev) => ({ ...prev, [key]: Number.isFinite(num) ? num : 0 }));
  }

  const weightTotal =
    (form?.weight_wn8 ?? 0) +
    (form?.weight_winrate ?? 0) +
    (form?.weight_battles ?? 0) +
    (form?.weight_tier10 ?? 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recrutement — score &amp; filtres</CardTitle>
      </CardHeader>
      <CardBody className="space-y-4 text-sm">
        <p className="text-atfr-fog">
          Seuils et pondérations utilisés par le filtre de l'onglet Mouvements, le score de
          recrutement et les embeds Discord. Stats sourcées via tomato.gg.
        </p>

        {settings.isLoading ? (
          <Spinner label="Chargement…" />
        ) : settings.isError ? (
          <Alert tone="danger">{(settings.error as Error).message}</Alert>
        ) : form ? (
          <>
            {update.isError && <Alert tone="danger">{(update.error as Error).message}</Alert>}
            {update.isSuccess && <Alert tone="success">Réglages enregistrés.</Alert>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                label="WN8 minimum (filtre)"
                value={form.min_wn8 ?? 0}
                onChange={(e) => setField('min_wn8', e.target.value)}
              />
              <Input
                type="number"
                label="Batailles minimum (filtre)"
                value={form.min_battles ?? 0}
                onChange={(e) => setField('min_battles', e.target.value)}
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-atfr-fog mb-2">
                Poids du score de recrutement ({weightTotal} au total — n'a pas besoin de faire 100,
                la moyenne est normalisée)
              </p>
              <div className="grid gap-3 sm:grid-cols-4">
                <Input
                  type="number"
                  label="WN8"
                  value={form.weight_wn8 ?? 0}
                  onChange={(e) => setField('weight_wn8', e.target.value)}
                />
                <Input
                  type="number"
                  label="Winrate"
                  value={form.weight_winrate ?? 0}
                  onChange={(e) => setField('weight_winrate', e.target.value)}
                />
                <Input
                  type="number"
                  label="Batailles"
                  value={form.weight_battles ?? 0}
                  onChange={(e) => setField('weight_battles', e.target.value)}
                />
                <Input
                  type="number"
                  label="Nb. tier 10"
                  value={form.weight_tier10 ?? 0}
                  onChange={(e) => setField('weight_tier10', e.target.value)}
                />
              </div>
            </div>

            <Button onClick={() => update.mutate(form)} disabled={update.isPending}>
              {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        ) : null}
      </CardBody>
    </Card>
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
