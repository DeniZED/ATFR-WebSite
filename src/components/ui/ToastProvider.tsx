import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ToastContext,
  type ToastFn,
  type ToastOptions,
  type ToastTone,
} from '@/hooks/useToast';
import { setToastListener } from '@/lib/toast-bus';

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-green-500/40 text-green-300',
  danger: 'border-red-500/40 text-red-300',
  info: 'border-atfr-gold/40 text-atfr-gold',
};

const TONE_ICONS: Record<ToastTone, ReactNode> = {
  success: <CheckCircle2 size={15} className="shrink-0" />,
  danger: <XCircle size={15} className="shrink-0" />,
  info: <Info size={15} className="shrink-0" />,
};

/**
 * Toaster unifié (P2-3) : pile de notifications en bas à droite,
 * auto-effacées, annoncées aux lecteurs d'écran via aria-live.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastFn>(
    (options: ToastOptions | string) => {
      const opts = typeof options === 'string' ? { message: options } : options;
      const id = nextId.current++;
      setToasts((prev) => [
        ...prev.slice(-3), // au plus 4 toasts simultanés
        { id, message: opts.message, tone: opts.tone ?? 'success' },
      ]);
      window.setTimeout(() => dismiss(id), opts.durationMs ?? 4000);
    },
    [dismiss],
  );

  // Expose le toaster au code hors-React (MutationCache global, etc.).
  useEffect(() => {
    setToastListener(toast);
    return () => setToastListener(null);
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 rounded-lg border bg-atfr-carbon/95 backdrop-blur px-3.5 py-2.5 text-sm shadow-xl shadow-black/40',
              TONE_STYLES[t.tone],
            )}
          >
            {TONE_ICONS[t.tone]}
            <span className="text-atfr-bone flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Fermer la notification"
              className="text-atfr-fog hover:text-atfr-bone"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
