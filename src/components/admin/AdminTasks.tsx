import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Card, CardBody, Spinner } from '@/components/ui';

export interface AdminTask {
  key: string;
  /** Nombre d'éléments en attente. Une tâche à 0 n'est pas affichée. */
  count: number;
  /** Libellé au singulier (count === 1). */
  singular: string;
  /** Libellé au pluriel. */
  plural: string;
  to: string;
  icon: ReactNode;
}

/**
 * Bloc « À traiter » du dashboard : ne liste que les tâches réellement en
 * attente (count > 0), chacune cliquable vers sa page. Si tout est à jour,
 * affiche un état vide positif. Les tâches invisibles au rôle sont filtrées
 * en amont (l'appelant ne passe que celles auxquelles il a accès).
 */
export function AdminTasks({
  tasks,
  loading,
}: {
  tasks: AdminTask[];
  loading: boolean;
}) {
  const pending = tasks.filter((t) => t.count > 0);
  const total = pending.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg text-atfr-bone">À traiter</h2>
          {!loading && total > 0 && (
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-atfr-gold/15 border border-atfr-gold/30 text-atfr-gold text-xs font-medium tabular-nums">
              {total}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-3 py-3 text-atfr-fog">
            <CheckCircle2 size={18} className="text-atfr-success shrink-0" />
            <p className="text-sm">Tout est à jour — rien à traiter pour l'instant.</p>
          </div>
        ) : (
          <ul className="divide-y divide-atfr-gold/10">
            {pending.map((task) => (
              <li key={task.key}>
                <Link
                  to={task.to}
                  className="group flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-atfr-graphite/50 transition-colors"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-atfr-gold/25 bg-atfr-gold/10 text-atfr-gold">
                    {task.icon}
                  </span>
                  <span className="text-lg font-display text-atfr-bone tabular-nums w-8 shrink-0">
                    {task.count}
                  </span>
                  <span className="flex-1 text-sm text-atfr-fog">
                    {task.count === 1 ? task.singular : task.plural}
                  </span>
                  <ChevronRight
                    size={16}
                    className="shrink-0 text-atfr-fog/60 group-hover:text-atfr-gold transition-colors"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
