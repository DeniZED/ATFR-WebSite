import type { ToastFn, ToastOptions } from '@/hooks/useToast';

// Pont module-level entre le monde hors-React (ex. MutationCache de React
// Query, configuré dans main.tsx avant tout rendu) et le <ToastProvider>
// monté à la racine. Le provider s'enregistre ici au montage ; tant qu'aucun
// listener n'est monté, les émissions sont ignorées silencieusement.

let listener: ToastFn | null = null;

export function setToastListener(fn: ToastFn | null): void {
  listener = fn;
}

export function emitToast(options: ToastOptions | string): void {
  listener?.(options);
}
