import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FileDropzoneProps {
  accept?: string;
  maxSizeMb?: number;
  onFile: (file: File) => void | Promise<void>;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

export function FileDropzone({
  accept = 'image/*,video/*',
  maxSizeMb = 100,
  onFile,
  label = 'Glisser un fichier ici',
  hint = 'ou cliquer pour choisir',
  disabled,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hover, setHover] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = useCallback(
    async (file: File) => {
      setErr(null);
      if (file.size > maxSizeMb * 1024 * 1024) {
        setErr(`Fichier trop volumineux (max ${maxSizeMb} Mo).`);
        return;
      }
      await onFile(file);
    },
    [maxSizeMb, onFile],
  );

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setHover(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handle(file);
  };

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
          hover
            ? 'border-atfr-gold bg-atfr-gold/5'
            : 'border-atfr-gold/30 hover:border-atfr-gold/60',
          disabled && 'opacity-50 pointer-events-none',
        )}
      >
        <Upload size={28} className="text-atfr-gold" strokeWidth={1.6} />
        <p className="text-sm font-medium text-atfr-bone">{label}</p>
        <p className="text-xs text-atfr-fog">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
            e.target.value = '';
          }}
        />
      </label>
      {err && <p className="text-xs text-atfr-danger">{err}</p>}
    </div>
  );
}
