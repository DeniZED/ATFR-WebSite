import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Card, CardBody, Input, Select, Spinner, Textarea } from '@/components/ui';
import { useCwEvents, useDeleteCwEvent, useUpsertCwEvent } from '@/features/cw/queries';
import {
  CW_EVENT_STATUS_LABELS,
  CW_EVENT_TYPE_LABELS,
  type CwEventStatus,
  type CwEventType,
} from '@/types/database';

export default function AdminCwEvents() {
  const list = useCwEvents();
  const remove = useDeleteCwEvent();
  const upsert = useUpsertCwEvent();

  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">Clan Wars</p>
          <h1 className="font-display text-3xl text-atfr-bone">Campagnes CW</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouvelle campagne
        </Button>
      </div>

      {open && (
        <CwEventForm
          eventId={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
        />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucune campagne CW.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((e) => (
            <Card key={e.id}>
              <CardBody className="p-5 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-atfr-bone">{e.title}</h3>
                    <Badge variant="gold">{CW_EVENT_STATUS_LABELS[e.status]}</Badge>
                  </div>
                  <p className="text-sm text-atfr-fog">
                    {CW_EVENT_TYPE_LABELS[e.type]} · {new Date(e.starts_at).toLocaleDateString('fr-FR')} —{' '}
                    {new Date(e.ends_at).toLocaleDateString('fr-FR')} · {e.slot_start_time}–{e.slot_end_time}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link to={`/admin/clan-wars/${e.id}`}>
                    <Button size="sm" variant="secondary">
                      Gérer
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setEditing(e.id);
                      setOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    leadingIcon={<Trash2 size={14} />}
                    onClick={() => {
                      if (confirm('Supprimer cette campagne ?')) remove.mutate(e.id);
                    }}
                    disabled={remove.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {upsert.isError && (
        <Alert tone="danger" title="Erreur">
          {(upsert.error as Error).message}
        </Alert>
      )}
    </div>
  );
}

function CwEventForm({ eventId, onClose }: { eventId: string | null; onClose: () => void }) {
  const list = useCwEvents();
  const upsert = useUpsertCwEvent();
  const existing = eventId ? list.data?.find((e) => e.id === eventId) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [type] = useState<CwEventType>(existing?.type ?? 'campagne_char_manoeuvres');
  const [startsAt, setStartsAt] = useState(existing?.starts_at?.slice(0, 10) ?? '');
  const [endsAt, setEndsAt] = useState(existing?.ends_at?.slice(0, 10) ?? '');
  const [slotStart, setSlotStart] = useState(existing?.slot_start_time?.slice(0, 5) ?? '21:00');
  const [slotEnd, setSlotEnd] = useState(existing?.slot_end_time?.slice(0, 5) ?? '23:00');
  const [status, setStatus] = useState<CwEventStatus>(existing?.status ?? 'draft');

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      title,
      description: description || null,
      type,
      starts_at: startsAt,
      ends_at: endsAt,
      slot_start_time: slotStart,
      slot_end_time: slotEnd,
      status,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-2"
            required
          />
          <Select label="Type" value={type} disabled>
            <option value={type}>{CW_EVENT_TYPE_LABELS[type]}</option>
          </Select>
          <Select label="Statut" value={status} onChange={(e) => setStatus(e.target.value as CwEventStatus)}>
            {Object.entries(CW_EVENT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
          <Input
            label="Début"
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
          <Input
            label="Fin"
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
          />
          <Input
            label="Créneau — début"
            type="time"
            value={slotStart}
            onChange={(e) => setSlotStart(e.target.value)}
          />
          <Input
            label="Créneau — fin"
            type="time"
            value={slotEnd}
            onChange={(e) => setSlotEnd(e.target.value)}
          />
          <Textarea
            label="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />

          <div className="flex gap-2 md:col-span-2 justify-end">
            <Button variant="ghost" type="button" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
