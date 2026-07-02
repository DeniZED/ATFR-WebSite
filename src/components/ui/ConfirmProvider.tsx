import { useCallback, useRef, useState, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { ModalShell } from './ModalShell';
import {
  ConfirmContext,
  type ConfirmFn,
  type ConfirmOptions,
} from '@/hooks/useConfirm';

/**
 * Fournit useConfirm() à son sous-arbre et rend le dialogue de
 * confirmation accessible (ModalShell : role="dialog", piège de focus,
 * Echap = annuler). Monté dans AdminLayout — toutes les confirmations
 * admin passent par ici.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      // Un seul dialogue à la fois : une demande concurrente annule la
      // précédente plutôt que d'empiler.
      resolveRef.current?.(false);
      resolveRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  function close(result: boolean) {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <ModalShell
          label={options.title ?? 'Confirmation'}
          onClose={() => close(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-atfr-ink/80 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-xl border border-atfr-gold/20 bg-atfr-carbon shadow-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              {options.tone === 'danger' && (
                <div className="h-9 w-9 shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400">
                  <AlertTriangle size={16} />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-display text-lg text-atfr-bone">
                  {options.title ?? 'Confirmation'}
                </h2>
                <p className="text-sm text-atfr-fog mt-1 whitespace-pre-wrap">
                  {options.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => close(false)}>
                {options.cancelLabel ?? 'Annuler'}
              </Button>
              <Button
                variant={options.tone === 'danger' ? 'danger' : undefined}
                onClick={() => close(true)}
              >
                {options.confirmLabel ?? 'Confirmer'}
              </Button>
            </div>
          </div>
        </ModalShell>
      )}
    </ConfirmContext.Provider>
  );
}
