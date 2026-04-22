import { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Trash2, Upload, Video } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { FileDropzone } from '@/components/admin/FileDropzone';
import { useMediaAssets, useUploadMedia } from '@/features/media/queries';
import type { MediaKind } from '@/types/database';

interface MediaPickerProps {
  label: string;
  kind: MediaKind;
  value: string;
  onChange: (url: string) => void;
}

export function MediaPicker({ label, kind, value, onChange }: MediaPickerProps) {
  const [panel, setPanel] = useState(false);
  const { data: assets } = useMediaAssets(kind);
  const upload = useUploadMedia();

  async function handleUpload(file: File) {
    const asset = await upload.mutateAsync({ file });
    onChange(asset.public_url);
    setPanel(false);
  }

  const Icon = kind === 'video' ? Video : ImageIcon;

  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-atfr-fog">
        {label}
      </label>

      <div className="rounded-lg border border-atfr-gold/20 bg-atfr-graphite/40 p-3">
        {value ? (
          <div className="flex items-start gap-3">
            <div className="h-24 w-40 shrink-0 overflow-hidden rounded-md border border-atfr-gold/20 bg-atfr-ink flex items-center justify-center">
              {kind === 'image' ? (
                <img
                  src={value}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={value}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="truncate text-xs text-atfr-fog">{value}</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline"
                >
                  <ExternalLink size={12} /> Ouvrir
                </a>
                <button
                  type="button"
                  onClick={() => setPanel((p) => !p)}
                  className="inline-flex items-center gap-1 text-xs text-atfr-bone hover:text-atfr-gold"
                >
                  <Upload size={12} /> Remplacer
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1 text-xs text-atfr-danger hover:underline"
                >
                  <Trash2 size={12} /> Retirer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-atfr-fog">
              <Icon size={18} className="text-atfr-gold" strokeWidth={1.6} />
              Aucun {kind === 'video' ? 'média vidéo' : 'média image'} sélectionné.
            </div>
            <Button size="sm" variant="outline" onClick={() => setPanel((p) => !p)}>
              Choisir / Uploader
            </Button>
          </div>
        )}

        {panel && (
          <div className="mt-4 border-t border-atfr-gold/10 pt-4 space-y-4">
            <FileDropzone
              accept={kind === 'video' ? 'video/*' : 'image/*'}
              onFile={handleUpload}
              disabled={upload.isPending}
              label={
                upload.isPending
                  ? 'Upload en cours…'
                  : `Glisser un ${kind === 'video' ? 'fichier vidéo' : 'fichier image'}`
              }
            />

            {assets && assets.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-atfr-fog mb-2">
                  Ou choisir un média existant
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {assets.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onChange(a.public_url);
                        setPanel(false);
                      }}
                      className={cn(
                        'group aspect-video overflow-hidden rounded-md border transition-colors',
                        value === a.public_url
                          ? 'border-atfr-gold'
                          : 'border-atfr-gold/20 hover:border-atfr-gold/60',
                      )}
                    >
                      {a.kind === 'image' ? (
                        <img
                          src={a.public_url}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <video
                          src={a.public_url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
