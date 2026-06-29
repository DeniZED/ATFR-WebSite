import { SearchX } from 'lucide-react';

export function EmptyState({ message = 'Aucun résultat' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <SearchX size={36} className="text-atfr-fog/40" strokeWidth={1.4} />
      <p className="text-sm text-atfr-fog">{message}</p>
    </div>
  );
}
