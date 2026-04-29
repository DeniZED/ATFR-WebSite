import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Spinner,
  Switch,
} from '@/components/ui';
import { MinimapClickPlacer } from '@/components/admin/MinimapClickPlacer';
import {
  useGeoMaps,
  useGeoShots,
  useUpsertShot,
} from '@/features/geoguesser/queries';
import { useUploadMedia } from '@/features/media/queries';
import {
  DIFFICULTY_LABELS,
  type QuizDifficulty,
} from '@/types/database';
import { cn } from '@/lib/cn';

type DraftStatus =
  | 'uploading'
  | 'placing'
  | 'ready'
  | 'saving'
  | 'saved'
  | 'error';

interface DraftShot {
  localId: string;
  fileName: string;
  imageUrl: string;
  x: number | null;
  y: number | null;
  difficulty: QuizDifficulty;
  caption: string;
  status: DraftStatus;
  error?: string | null;
}

let nextLocalId = 1;
function makeId() {
  return `draft_${Date.now()}_${nextLocalId++}`;
}

export default function AdminGeoShotsBulk() {
  const [params, setParams] = useSearchParams();
  const initialMap = params.get('map') ?? '';

  const maps = useGeoMaps({ activeOnly: true });
  const [mapId, setMapId] = useState(initialMap);
  const existingShots = useGeoShots({ mapId: mapId || undefined });

  const upload = useUploadMedia();
  const upsert = useUpsertShot();

  const [drafts, setDrafts] = useState<DraftShot[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [defaultDifficulty, setDefaultDifficulty] = useState<QuizDifficulty>(
    'easy',
  );
  const [publishOnSave, setPublishOnSave] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMap = useMemo(
    () => maps.data?.find((m) => m.id === mapId) ?? null,
    [maps.data, mapId],
  );
  const selectedDraft = useMemo(
    () => drafts.find((d) => d.localId === selectedId) ?? null,
    [drafts, selectedId],
  );

  const ghostPoints = useMemo(() => {
    const fromDb =
      existingShots.data?.map((s) => ({ x: s.x_pct, y: s.y_pct })) ?? [];
    const fromDrafts = drafts
      .filter(
        (d) =>
          d.localId !== selectedId &&
          d.x != null &&
          d.y != null &&
          d.status !== 'saved',
      )
      .map((d) => ({ x: d.x as number, y: d.y as number }));
    return [...fromDb, ...fromDrafts];
  }, [existingShots.data, drafts, selectedId]);

  function patchDraft(localId: string, patch: Partial<DraftShot>) {
    setDrafts((prev) =>
      prev.map((d) => (d.localId === localId ? { ...d, ...patch } : d)),
    );
  }

  const onChangeMap = useCallback(
    (id: string) => {
      setMapId(id);
      setParams((p) => {
        const next = new URLSearchParams(p);
        if (id) next.set('map', id);
        else next.delete('map');
        return next;
      });
    },
    [setParams],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setGlobalError(null);
      if (!mapId) {
        setGlobalError('Sélectionne d’abord une map.');
        return;
      }
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (files.length === 0) return;

      const created: DraftShot[] = files.map((f) => ({
        localId: makeId(),
        fileName: f.name,
        imageUrl: '',
        x: null,
        y: null,
        difficulty: defaultDifficulty,
        caption: '',
        status: 'uploading',
      }));
      setDrafts((prev) => [...prev, ...created]);
      if (!selectedId) setSelectedId(created[0].localId);

      // Upload sequentially to keep network sane.
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const localId = created[i].localId;
        try {
          const asset = await upload.mutateAsync({ file: f });
          patchDraft(localId, {
            imageUrl: asset.public_url,
            status: 'placing',
          });
        } catch (err) {
          patchDraft(localId, {
            status: 'error',
            error: (err as Error).message,
          });
        }
      }
    },
    [mapId, defaultDifficulty, upload, selectedId],
  );

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setHover(false);
    if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
  }

  function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) void handleFiles(e.target.files);
    e.target.value = '';
  }

  function placeOnSelected(x: number, y: number) {
    if (!selectedDraft) return;
    patchDraft(selectedDraft.localId, {
      x,
      y,
      status: selectedDraft.status === 'saved' ? 'saved' : 'ready',
    });
  }

  function removeDraft(localId: string) {
    setDrafts((prev) => prev.filter((d) => d.localId !== localId));
    if (selectedId === localId) {
      const remaining = drafts.filter((d) => d.localId !== localId);
      setSelectedId(remaining[0]?.localId ?? null);
    }
  }

  async function saveAll() {
    setGlobalError(null);
    if (!mapId) {
      setGlobalError('Sélectionne une map.');
      return;
    }
    const ready = drafts.filter(
      (d) => d.status === 'ready' && d.x != null && d.y != null && d.imageUrl,
    );
    if (ready.length === 0) {
      setGlobalError('Aucun screenshot prêt à enregistrer.');
      return;
    }

    for (const d of ready) {
      patchDraft(d.localId, { status: 'saving', error: null });
      try {
        await upsert.mutateAsync({
          map_id: mapId,
          image_url: d.imageUrl,
          x_pct: d.x as number,
          y_pct: d.y as number,
          difficulty: d.difficulty,
          caption: d.caption || null,
          tags: [],
          is_published: publishOnSave,
        });
        patchDraft(d.localId, { status: 'saved' });
      } catch (err) {
        patchDraft(d.localId, {
          status: 'error',
          error: (err as Error).message,
        });
      }
    }
  }

  const readyCount = drafts.filter((d) => d.status === 'ready').length;
  const savedCount = drafts.filter((d) => d.status === 'saved').length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/geoguesser/shots"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> Retour aux screenshots
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie · GeoGuesser
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">
          Ajout en lot de screenshots
        </h1>
        <p className="text-sm text-atfr-fog mt-1">
          Choisis une map, dépose plusieurs screens d’un coup, place chaque
          point. Les pings déjà placés sur la map apparaissent en jaune
          translucide pour repérer les zones non couvertes.
        </p>
      </div>

      {globalError && <Alert tone="danger">{globalError}</Alert>}

      <Card>
        <CardBody className="p-5 grid gap-4 md:grid-cols-3">
          <Select
            label="Map"
            value={mapId}
            onChange={(e) => onChangeMap(e.target.value)}
            required
          >
            <option value="">— Choisir une map —</option>
            {(maps.data ?? []).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
          <Select
            label="Difficulté par défaut"
            value={defaultDifficulty}
            onChange={(e) =>
              setDefaultDifficulty(e.target.value as QuizDifficulty)
            }
          >
            {(Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]).map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </Select>
          <div className="flex items-end">
            <Switch
              checked={publishOnSave}
              onChange={setPublishOnSave}
              label={
                publishOnSave
                  ? 'Publier dès enregistrement'
                  : 'Sauver en brouillon'
              }
            />
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* LEFT — drop zone + queue */}
        <div className="space-y-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              if (mapId) setHover(true);
            }}
            onDragLeave={() => setHover(false)}
            onDrop={onDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
              hover
                ? 'border-atfr-gold bg-atfr-gold/5'
                : 'border-atfr-gold/30 hover:border-atfr-gold/60',
              !mapId && 'opacity-50 pointer-events-none',
            )}
          >
            <Upload size={28} className="text-atfr-gold" strokeWidth={1.6} />
            <p className="text-sm font-medium text-atfr-bone">
              Glisser plusieurs screenshots ici
            </p>
            <p className="text-xs text-atfr-fog">
              ou cliquer pour les choisir
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onPickFiles}
            />
          </label>

          {drafts.length > 0 && (
            <Card>
              <CardBody className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-atfr-fog">
                  <span>
                    {drafts.length} screen(s) · {readyCount} prêt(s) ·{' '}
                    {savedCount} sauvé(s)
                  </span>
                  <Button
                    size="sm"
                    onClick={saveAll}
                    disabled={readyCount === 0 || upsert.isPending}
                    leadingIcon={<Save size={14} />}
                  >
                    Enregistrer ({readyCount})
                  </Button>
                </div>
                <ul className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {drafts.map((d) => {
                    const active = d.localId === selectedId;
                    return (
                      <li key={d.localId}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(d.localId)}
                          className={cn(
                            'w-full flex items-center gap-3 rounded-md border p-2 text-left transition-colors',
                            active
                              ? 'border-atfr-gold bg-atfr-gold/10'
                              : 'border-atfr-gold/15 hover:border-atfr-gold/40',
                          )}
                        >
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-atfr-graphite">
                            {d.imageUrl ? (
                              <img
                                src={d.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Loader2
                                  size={14}
                                  className="animate-spin text-atfr-gold"
                                />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs text-atfr-bone">
                              {d.fileName}
                            </p>
                            <div className="mt-1">
                              <DraftStatusBadge draft={d} />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDraft(d.localId);
                            }}
                            className="text-atfr-fog hover:text-atfr-danger"
                            title="Retirer"
                          >
                            <X size={14} />
                          </button>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

        {/* RIGHT — selected draft preview + placer */}
        <div className="space-y-4">
          {!selectedMap ? (
            <Card>
              <CardBody className="p-8 text-center text-atfr-fog text-sm">
                Choisis d’abord une map dans le menu déroulant.
              </CardBody>
            </Card>
          ) : !selectedDraft ? (
            <Card>
              <CardBody className="p-8 text-center text-atfr-fog text-sm">
                Dépose des screenshots à gauche pour commencer.
              </CardBody>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden">
                <CardBody className="p-0">
                  <div className="aspect-video bg-atfr-graphite">
                    {selectedDraft.imageUrl ? (
                      <img
                        src={selectedDraft.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Spinner />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Select
                        label="Difficulté"
                        value={selectedDraft.difficulty}
                        onChange={(e) =>
                          patchDraft(selectedDraft.localId, {
                            difficulty: e.target.value as QuizDifficulty,
                          })
                        }
                      >
                        {(
                          Object.keys(DIFFICULTY_LABELS) as QuizDifficulty[]
                        ).map((d) => (
                          <option key={d} value={d}>
                            {DIFFICULTY_LABELS[d]}
                          </option>
                        ))}
                      </Select>
                      <Input
                        label="Caption (optionnelle)"
                        value={selectedDraft.caption}
                        onChange={(e) =>
                          patchDraft(selectedDraft.localId, {
                            caption: e.target.value,
                          })
                        }
                      />
                    </div>
                    {selectedDraft.error && (
                      <Alert tone="danger">{selectedDraft.error}</Alert>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      leadingIcon={<Trash2 size={14} />}
                      onClick={() => removeDraft(selectedDraft.localId)}
                    >
                      Retirer ce screenshot
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold">
                    Place le point sur {selectedMap.name}
                  </p>
                  <MinimapClickPlacer
                    imageUrl={selectedMap.image_url}
                    x={selectedDraft.x}
                    y={selectedDraft.y}
                    ghostPoints={ghostPoints}
                    onPlace={placeOnSelected}
                  />
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DraftStatusBadge({ draft }: { draft: DraftShot }) {
  switch (draft.status) {
    case 'uploading':
      return <Badge variant="neutral">Upload…</Badge>;
    case 'placing':
      return <Badge variant="outline">À placer</Badge>;
    case 'ready':
      return (
        <Badge variant="gold">
          <CheckCircle2 size={10} className="inline" /> Point placé
        </Badge>
      );
    case 'saving':
      return <Badge variant="neutral">Enregistrement…</Badge>;
    case 'saved':
      return (
        <Badge variant="success">
          <CheckCircle2 size={10} className="inline" /> Sauvé
        </Badge>
      );
    case 'error':
      return <Badge variant="danger">Erreur</Badge>;
  }
}
