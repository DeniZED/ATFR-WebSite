import { createContext, useContext } from 'react';

// Système de toasts unifié (P2-3) : notifications transitoires non
// bloquantes, rendues par <ToastProvider> (src/components/ui/ToastProvider.tsx)
// dans une région aria-live. À privilégier aux états "saved"/"message" ad hoc
// des pages admin pour les confirmations d'action.

export type ToastTone = 'success' | 'danger' | 'info';

export interface ToastOptions {
  message: string;
  tone?: ToastTone;
  /** Durée d'affichage en ms. Défaut : 4000. */
  durationMs?: number;
}

export type ToastFn = (options: ToastOptions | string) => void;

export const ToastContext = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé sous <ToastProvider>.');
  return ctx;
}
