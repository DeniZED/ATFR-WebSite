import { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
} from '@/components/ui';
import { FileDropzone } from '@/components/admin/FileDropzone';
import {
  useDeleteMedia,
  useMediaAssets,
  useUpdateMedia,
  useUploadMedia,
} from '@/features/media/queries';
import type { Database, MediaKind } from '@/types/database';

type MediaRow = Database['public']['Tables']['media_assets']['Row'];

export default function AdminGallery() {
  const [filter, setFilter] = useState<MediaKind | 'all'>('all');
  const { data, isLoading } = useMediaAssets();
  const upload = useUploadMedia();
  const update = useUpdateMedia();
  const remove = useDeleteMedia();
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = (data ?? []).filter((a) =>
    filter === 'all' ? true : a.kind === filter,
  );

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Médias
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Galerie</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Images et vidéos utilisables partout (hero, highlights, palmarès…).
        </p>
      </div>

      <Card>
        <CardBody className="p-5">
          <FileDropzone
            onFile={async (file) => {
              await upload.mutateAsync({ file });
            }}
            disabled={upload.isPending}
            label={upload.isPending ? 'Upload en cours…' : 'Uploader un média'}
            hint="Formats : images (png, jpeg, webp, svg), vidéos (mp4, webm). Max 100 Mo."
          />
          {upload.isError && (
            <Alert tone="danger" className="mt-3">
              {(upload.error as Error).message}
            </Alert>
          )}
        </CardBody>
      </Card>

      <div className="flex flex-wrap gap-2">
        {(['all', 'image', 'video'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? 'rounded-full bg-atfr-gold text-atfr-ink px-3 py-1 text-xs uppercase tracking-wider'
                : 'rounded-full border border-atfr-gold/30 px-3 py-1 text-xs uppercase tracking-wider text-atfr-fog hover:text-atfr-bone'
            }
          >
            {f === 'all' ? 'Tous' : f === 'image' ? 'Images' : 'Vidéos'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucun média.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <MediaCard
              key={a.id}
              asset={a}
              onCopy={copy}
              copied={copied === a.public_url}
              onUpdate={(patch) => update.mutateAsync({ id: a.id, ...patch })}
              onDelete={() => remove.mutateAsync({ id: a.id, path: a.path })}
              deleting={remove.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface MediaCardProps {
  asset: MediaRow;
  onCopy: (url: string) => void;
  copied: boolean;
  onUpdate: (patch: { caption?: string | null }) => Promise<void>;
  onDelete: () => Promise<void>;
  deleting: boolean;
}

function MediaCard({
  asset,
  onCopy,
  copied,
  onUpdate,
  onDelete,
  deleting,
}: MediaCardProps) {
  const [caption, setCaption] = useState(asset.caption ?? '');
  const dirty = caption !== (asset.caption ?? '');

  return (
    <Card>
      <CardBody className="p-0 overflow-hidden">
        <div className="aspect-video bg-atfr-ink">
          {asset.kind === 'image' ? (
            <img
              src={asset.public_url}
              alt={asset.caption ?? ''}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <video
              src={asset.public_url}
              className="h-full w-full object-cover"
              muted
              playsInline
              controls
            />
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant={asset.kind === 'video' ? 'gold' : 'outline'}>
              {asset.kind}
            </Badge>
            {asset.size_bytes && (
              <span className="text-xs text-atfr-fog">
                {(asset.size_bytes / 1024 / 1024).toFixed(2)} Mo
              </span>
            )}
          </div>

          <Input
            label="Légende"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <div className="flex gap-2">
            {dirty && (
              <Button
                size="sm"
                onClick={() => onUpdate({ caption: caption || null })}
              >
                Enregistrer
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              leadingIcon={<Copy size={12} />}
              onClick={() => onCopy(asset.public_url)}
            >
              {copied ? 'Copié !' : 'Copier URL'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              leadingIcon={<Trash2 size={12} />}
              onClick={() => {
                if (confirm('Supprimer ce média ?')) void onDelete();
              }}
              disabled={deleting}
              className="ml-auto"
            >
              Supprimer
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
