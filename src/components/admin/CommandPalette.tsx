import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { matchesSearch } from '@/lib/text-search';
import { useModalA11y } from '@/hooks/useModalA11y';
import { flattenNav, type FlatNavItem } from '@/components/layout/adminNav';

/**
 * Palette de commandes admin (⌘K / Ctrl+K) : recherche floue (sans accent) sur
 * toutes les pages admin, navigation clavier, respect des accès par rôle.
 * L'ouverture/fermeture est pilotée par AdminLayout ; ce composant ne gère que
 * l'UI quand `open` est vrai.
 */
export function CommandPalette({
  open,
  onClose,
  canAccess,
}: {
  open: boolean;
  onClose: () => void;
  canAccess: (moduleKey: string) => boolean;
}) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useModalA11y<HTMLDivElement>({ onClose, enabled: open });

  const accessibleItems = useMemo(
    () => flattenNav().filter((item) => !item.moduleKey || canAccess(item.moduleKey)),
    [canAccess],
  );

  const results = useMemo(
    () =>
      accessibleItems.filter((item) =>
        matchesSearch(query, item.label, item.group),
      ),
    [accessibleItems, query],
  );

  // Réinitialise la recherche à chaque ouverture et focalise le champ.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Laisse le temps au DOM de monter avant de focaliser.
      const id = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Garde l'élément actif dans les bornes quand la liste change.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, results.length - 1)));
  }, [results.length]);

  if (!open) return null;

  function go(item: FlatNavItem | undefined) {
    if (!item) return;
    navigate(item.to);
    onClose();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[activeIndex]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[12vh] bg-atfr-ink/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-atfr-gold/20 bg-atfr-carbon shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-atfr-gold/10 px-4">
          <Search size={16} className="shrink-0 text-atfr-fog" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Aller à une page…"
            className="flex-1 bg-transparent py-3.5 text-sm text-atfr-bone placeholder:text-atfr-fog/60 focus:outline-none"
            aria-label="Rechercher une page admin"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-atfr-fog">
              Aucune page pour « {query} ».
            </li>
          ) : (
            results.map((item, i) => (
              <li key={item.to}>
                <button
                  type="button"
                  onClick={() => go(item)}
                  onMouseMove={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    i === activeIndex
                      ? 'bg-atfr-gold/10 text-atfr-bone'
                      : 'text-atfr-fog hover:text-atfr-bone',
                  )}
                >
                  <item.icon size={16} strokeWidth={1.5} className="shrink-0 text-atfr-gold" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-atfr-fog/60">
                    {item.group}
                  </span>
                  {i === activeIndex && (
                    <CornerDownLeft size={13} className="shrink-0 text-atfr-gold/70" />
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-3 border-t border-atfr-gold/10 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-atfr-fog/60">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>Échap fermer</span>
        </div>
      </div>
    </div>
  );
}
