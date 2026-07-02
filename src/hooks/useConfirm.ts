import { createContext, useContext } from 'react';

// Remplaçant accessible des window.confirm() natifs (P2-2) : promesse
// résolue à true/false selon le choix, dialogue rendu par <ConfirmProvider>
// (src/components/ui/ConfirmProvider.tsx) sur base ModalShell — donc avec
// role="dialog", piège de focus et fermeture Echap, contrairement au natif
// qui bloquait le thread et échappait au design system.

export interface ConfirmOptions {
  /** Titre court du dialogue. Défaut : « Confirmation ». */
  title?: string;
  message: string;
  /** Libellé du bouton de confirmation. Défaut : « Confirmer ». */
  confirmLabel?: string;
  /** Libellé du bouton d'annulation. Défaut : « Annuler ». */
  cancelLabel?: string;
  /** 'danger' pour les actions destructives (bouton rouge). */
  tone?: 'danger' | 'default';
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm doit être utilisé sous <ConfirmProvider>.');
  }
  return ctx;
}
