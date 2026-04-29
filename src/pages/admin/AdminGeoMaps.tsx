import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Spinner,
  Switch,
} from '@/components/ui';
import {
  ArrowLeft,
  Camera,
  Download,
  Image as ImageIcon,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  fetchWgMaps,
  useBulkUpsertMaps,
  useDeleteMap,
  useGeoMaps,
  useUpsertMap,
} from '@/features/geoguesser/queries';
import { MediaPicker } from '@/components/admin/MediaPicker';

export default function AdminGeoMaps() {
  const list = useGeoMaps();
  const bulkUpsert = useBulkUpsertMaps();
  const upsert = useUpsertMap();
  const remove = useDeleteMap();

  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function syncFromWg() {
    setSyncMessage(null);
    try {
      const wg = await fetchWgMaps();
      if (wg.length === 0) {
        setSyncMessage('Wargaming n’a renvoyé aucune map.');
        return;
      }
      const rows = wg.map((m, i) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        image_url: m.image_url,
        size_m: m.size_m,
        source: 'wg' as const,
        is_active: true,
        sort_order: i,
      }));
      await bulkUpsert.mutateAsync(rows);
      setSyncMessage(`✅ ${wg.length} maps synchronisées depuis Wargaming.`);
    } catch (err) {
      setSyncMessage(`Erreur : ${(err as Error).message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/geoguesser"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> GeoGuesser
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie · GeoGuesser
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Maps</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Synchronise la liste depuis Wargaming, ou ajoute des maps custom à la
          main. Une map désactivée reste en base mais ses screenshots ne
          sont plus jouables.
        </p>
      </div>

      <Card>
        <CardBody className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-display text-lg text-atfr-bone">
              Synchronisation Wargaming
            </p>
            <p className="text-xs text-atfr-fog">
              Pull <code>/wot/encyclopedia/arenas/</code> et upsert dans la
              base. Les overrides locaux (description, image) seront écrasés —
              à ne lancer que si tu veux remettre à jour.
            </p>
          </div>
          <Button
            onClick={syncFromWg}
            disabled={bulkUpsert.isPending}
            leadingIcon={<Download size={14} />}
          >
            {bulkUpsert.isPending ? 'Synchronisation…' : 'Synchroniser'}
          </Button>
        </CardBody>
      </Card>

      {syncMessage && (
        <Alert tone={syncMessage.startsWith('✅') ? 'success' : 'danger'}>
          {syncMessage}
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          leadingIcon={<Plus size={14} />}
          onClick={() => {
            setEditingId(null);
            setCreating(true);
          }}
        >
          Map manuelle
        </Button>
      </div>

      {creating && (
        <MapForm
          mapId={null}
          onClose={() => setCreating(false)}
        />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucune map. Lance la synchronisation Wargaming pour démarrer.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.data.map((m) => (
            <Card key={m.id}>
              <CardBody className="p-4 flex items-start gap-3">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-atfr-gold/20 bg-atfr-graphite flex items-center justify-center">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={20} className="text-atfr-fog" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-atfr-bone truncate">
                      {m.name}
                    </h3>
                    <Badge variant={m.source === 'wg' ? 'gold' : 'outline'}>
                      {m.source === 'wg' ? 'WG' : 'Manuel'}
                    </Badge>
                    {!m.is_active && <Badge variant="neutral">Inactive</Badge>}
                  </div>
                  <p className="text-xs text-atfr-fog mt-1">
                    id · <code>{m.id}</code>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCreating(false);
                        setEditingId(m.id);
                      }}
                    >
                      Modifier
                    </Button>
                    <Switch
                      checked={m.is_active}
                      onChange={(next) =>
                        upsert.mutate({ ...m, is_active: next })
                      }
                      label={m.is_active ? 'Active' : 'Désactivée'}
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer la map "${m.name}" ? Tous ses screenshots seront supprimés.`,
                          )
                        ) {
                          remove.mutate(m.id);
                        }
                      }}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                    <Link
                      to={`/admin/geoguesser/shots?map=${encodeURIComponent(m.id)}`}
                      className="inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline self-center"
                    >
                      <Camera size={12} /> screenshots
                    </Link>
                    <Link
                      to={`/admin/geoguesser/shots/bulk?map=${encodeURIComponent(m.id)}`}
                      className="inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline self-center"
                    >
                      <Layers size={12} /> ajout en lot
                    </Link>
                  </div>
                </div>
              </CardBody>
              {editingId === m.id && (
                <div className="border-t border-atfr-gold/10">
                  <MapForm
                    mapId={m.id}
                    onClose={() => setEditingId(null)}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MapForm({
  mapId,
  onClose,
}: {
  mapId: string | null;
  onClose: () => void;
}) {
  const list = useGeoMaps();
  const upsert = useUpsertMap();
  const existing = mapId ? list.data?.find((m) => m.id === mapId) : null;

  const [id, setId] = useState(existing?.id ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [imageUrl, setImageUrl] = useState(existing?.image_url ?? '');
  const [sortOrder, setSortOrder] = useState<number>(existing?.sort_order ?? 0);
  const [sizeM, setSizeM] = useState<number>(existing?.size_m ?? 1000);
  const [isActive, setIsActive] = useState(existing?.is_active ?? true);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !name.trim() || !imageUrl) return;
    await upsert.mutateAsync({
      id: id.trim(),
      name: name.trim(),
      description: description || null,
      image_url: imageUrl,
      size_m: sizeM,
      source: existing?.source ?? 'manual',
      sort_order: sortOrder,
      is_active: isActive,
    });
    onClose();
  }

  return (
    <CardBody className="p-5">
      <form onSubmit={save} className="grid gap-3 md:grid-cols-2">
        <input
          className="hidden"
          // hidden to preserve existing id; admins shouldn't rename slugs.
          readOnly
          value={id}
        />
        <div className="md:col-span-1">
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            ID (slug stable)
          </label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!existing}
            placeholder="ex. 12_himmelsdorf"
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone disabled:opacity-60"
            required
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Nom
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div className="md:col-span-2">
          <MediaPicker
            label="Minimap"
            kind="image"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Ordre
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-atfr-fog mb-1 block">
            Taille réelle (m)
          </label>
          <input
            type="number"
            min={100}
            max={5000}
            step={50}
            value={sizeM}
            onChange={(e) => setSizeM(Number(e.target.value))}
            className="w-full rounded-md border border-atfr-gold/20 bg-atfr-ink px-3 py-2 text-sm text-atfr-bone"
          />
          <p className="mt-1 text-[11px] text-atfr-fog">
            Côté de la map en mètres (1000 par défaut). Sert au calcul de la
            distance réelle entre le point joueur et le screen.
          </p>
        </div>
        <div className="flex items-center md:col-span-2">
          <Switch
            checked={isActive}
            onChange={setIsActive}
            label={isActive ? 'Active' : 'Désactivée'}
          />
        </div>
        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={upsert.isPending}>
            {upsert.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </CardBody>
  );
}
