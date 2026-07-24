import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardBody } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Section repliable du dashboard (Phase 8 — dashboard compact). Le contenu
 * n'est monté QUE lorsque la section est ouverte : les graphes recharts
 * (chargés en lazy) ne tirent leur chunk qu'à l'ouverture, gardant le premier
 * rendu du dashboard léger. Accessible : bouton `aria-expanded` + région liée.
 */
export function DashboardSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <Card>
      <CardBody className="p-0">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-atfr-graphite/40"
        >
          <ChevronDown
            size={18}
            className={cn(
              'shrink-0 text-atfr-fog transition-transform',
              open && 'rotate-180 text-atfr-gold',
            )}
          />
          <span className="flex-1">
            <span className="block font-display text-lg text-atfr-bone">
              {title}
            </span>
            {subtitle && (
              <span className="block text-xs text-atfr-fog">{subtitle}</span>
            )}
          </span>
        </button>
        {open && (
          <div id={panelId} className="space-y-6 border-t border-atfr-gold/10 p-5">
            {children}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
