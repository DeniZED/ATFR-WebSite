import { Button } from './Button';
import { cn } from '@/lib/cn';

interface FormActionsProps {
  onCancel: () => void;
  /** État isPending de la mutation d'enregistrement. */
  pending?: boolean;
  submitLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  /** Classes additionnelles du conteneur (ex. md:col-span-2). */
  className?: string;
}

/**
 * Pied de formulaire admin partagé (P2-2) : Annuler + Enregistrer avec
 * libellé d'attente — remplace le bloc dupliqué dans les pages CRUD.
 */
export function FormActions({
  onCancel,
  pending = false,
  submitLabel = 'Enregistrer',
  pendingLabel = 'Enregistrement…',
  cancelLabel = 'Annuler',
  className,
}: FormActionsProps) {
  return (
    <div className={cn('flex justify-end gap-2', className)}>
      <Button variant="ghost" type="button" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </Button>
    </div>
  );
}
