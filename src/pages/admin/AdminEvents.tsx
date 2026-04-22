import { useState, type FormEvent } from 'react';
import { format, parseISO } from 'date-fns';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  Textarea,
} from '@/components/ui';
import {
  useAllEvents,
  useDeleteEvent,
  useUpsertEvent,
} from '@/features/events/queries';
import { EVENT_TYPE_LABELS } from '@/lib/constants';
import type { EventType } from '@/types/database';

export default function AdminEvents() {
  const list = useAllEvents();
  const upsert = useUpsertEvent();
  const remove = useDeleteEvent();

  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Agenda
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Événements</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          leadingIcon={<Plus size={14} />}
        >
          Nouvel événement
        </Button>
      </div>

      {open && (
        <EventForm
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
        <p className="text-center text-atfr-fog py-10">Aucun événement.</p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((e) => (
            <Card key={e.id}>
              <CardBody className="p-5 flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-atfr-bone">
                      {e.title}
                    </h3>
                    <Badge variant="gold">{EVENT_TYPE_LABELS[e.type]}</Badge>
                    {!e.is_public && <Badge variant="neutral">Privé</Badge>}
                  </div>
                  <p className="text-sm text-atfr-fog">
                    {format(parseISO(e.starts_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                  {e.description && (
                    <p className="text-sm text-atfr-fog mt-2">{e.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
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
                      if (confirm('Supprimer ?')) remove.mutate(e.id);
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

function EventForm({
  eventId,
  onClose,
}: {
  eventId: string | null;
  onClose: () => void;
}) {
  const list = useAllEvents();
  const upsert = useUpsertEvent();
  const existing = eventId ? list.data?.find((e) => e.id === eventId) : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [type, setType] = useState<EventType>(existing?.type ?? 'training');
  const [startsAt, setStartsAt] = useState(
    existing?.starts_at
      ? existing.starts_at.slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [endsAt, setEndsAt] = useState(existing?.ends_at?.slice(0, 16) ?? '');
  const [isPublic, setIsPublic] = useState(existing?.is_public ?? true);
  const [location, setLocation] = useState(existing?.location ?? '');

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      id: existing?.id,
      title,
      description: description || null,
      type,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_public: isPublic,
      location: location || null,
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
            required
          />
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as EventType)}
          >
            {Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input
            label="Début"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
          />
          <Input
            label="Fin (optionnel)"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
          <Input
            label="Lieu"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="md:col-span-2"
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-2"
          />

          <label className="flex items-center gap-2 text-sm text-atfr-bone md:col-span-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 accent-atfr-gold"
            />
            Visible publiquement
          </label>

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
