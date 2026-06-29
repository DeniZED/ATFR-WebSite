import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Plus } from 'lucide-react';
import { Section, Card, CardBody, Badge, Button, Spinner, Input } from '@/components/ui';
import { useRole } from '@/hooks/useRole';
import { useCwEvents, useUpsertCwEvent } from '@/features/cw/queries';
import { CW_EVENT_STATUS_LABELS, type CwEventStatus } from '@/types/database';

const STATUS_VARIANT: Record<CwEventStatus, 'neutral' | 'success' | 'warning'> = {
  draft: 'neutral',
  open: 'success',
  closed: 'warning',
  archived: 'neutral',
};

export default function CwEventsList() {
  const { isModerator } = useRole();
  const { data: events, isLoading } = useCwEvents();
  const upsert = useUpsertCwEvent();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', starts_at: '', ends_at: '' });

  async function handleCreate() {
    if (!form.title || !form.starts_at || !form.ends_at) return;
    const event = await upsert.mutateAsync({
      title: form.title,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      status: 'draft',
    });
    setCreating(false);
    setForm({ title: '', starts_at: '', ends_at: '' });
    window.location.assign(`/clan/evenements/cw/${event.id}`);
  }

  return (
    <Section
      eyebrow="Espace membres"
      title="Clan Wars"
      description="Campagnes CW : inscriptions, dispo et composition des Line-Up."
      className="pt-10 sm:pt-16"
    >
      {isModerator && (
        <div className="mb-6 flex justify-end">
          {!creating ? (
            <Button variant="primary" size="md" onClick={() => setCreating(true)}>
              <Plus size={16} /> Nouvel événement
            </Button>
          ) : null}
        </div>
      )}

      {creating && (
        <Card className="mb-6">
          <CardBody className="space-y-4">
            <Input
              label="Titre de la campagne"
              placeholder="Campagne à char — Novembre 2025"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Début"
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
              <Input
                type="date"
                label="Fin"
                value={form.ends_at}
                onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setCreating(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleCreate} disabled={upsert.isPending}>
                Créer
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner label="Chargement…" /></div>
      ) : !events?.length ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl border border-atfr-gold/15 bg-atfr-graphite/40">
          <div className="h-14 w-14 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
            <Swords size={26} strokeWidth={1.6} />
          </div>
          <p className="text-sm text-atfr-fog">Aucune campagne CW pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} to={`/clan/evenements/cw/${event.id}`}>
              <Card className="h-full">
                <CardBody className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={STATUS_VARIANT[event.status]}>
                      {CW_EVENT_STATUS_LABELS[event.status]}
                    </Badge>
                  </div>
                  <h3 className="font-display text-lg text-atfr-bone">{event.title}</h3>
                  <p className="text-xs text-atfr-fog">
                    {new Date(event.starts_at).toLocaleDateString('fr-FR')} —{' '}
                    {new Date(event.ends_at).toLocaleDateString('fr-FR')}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
