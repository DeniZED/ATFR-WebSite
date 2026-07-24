import { cn } from '@/lib/cn';
import { DATA_QUALITY_LABELS, type DataQuality } from '@/features/rh/activity';

const DOT: Record<DataQuality['level'], string> = {
  complete: 'bg-atfr-success',
  partial: 'bg-atfr-warning',
  low: 'bg-atfr-danger',
};

function title(quality: DataQuality): string {
  const label = `Fiabilité ${DATA_QUALITY_LABELS[quality.level].toLowerCase()}`;
  return quality.reasons.length > 0
    ? `${label} — ${quality.reasons.join(' · ')}`
    : label;
}

/** Pastille compacte (tableau) : couleur + tooltip listant les raisons. */
export function DataQualityDot({ quality }: { quality: DataQuality }) {
  const t = title(quality);
  return (
    <span
      className={cn('inline-block h-2 w-2 shrink-0 rounded-full', DOT[quality.level])}
      title={t}
      aria-label={t}
    />
  );
}

/** Badge avec libellé (fiche joueur / cartes). */
export function DataQualityBadge({ quality }: { quality: DataQuality }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-atfr-gold/15 px-2 py-0.5 text-[11px]"
      title={title(quality)}
    >
      <span className={cn('h-2 w-2 rounded-full', DOT[quality.level])} />
      <span className="text-atfr-fog">
        Fiabilité {DATA_QUALITY_LABELS[quality.level].toLowerCase()}
      </span>
    </span>
  );
}
