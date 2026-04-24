import { Navigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ShieldAlert, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Select,
  Spinner,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import {
  useAdminUsers,
  useAssignRole,
  useRemoveRole,
} from '@/features/roles/queries';
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type UserRole,
} from '@/types/database';

const ALL_ROLES: UserRole[] = ['super_admin', 'admin', 'moderator', 'editor'];

export default function AdminUsers() {
  const { user } = useAuth();
  const { isSuperAdmin, isLoading: roleLoading } = useRole();
  const users = useAdminUsers();
  const assign = useAssignRole();
  const remove = useRemoveRole();

  if (roleLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Équipe
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Utilisateurs & rôles</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Réservé aux super admins. Créez d'abord l'utilisateur dans Supabase
          (Authentication → Users), puis attribuez-lui un rôle ici.
        </p>
      </div>

      <Card>
        <CardBody className="p-5 space-y-3 text-sm text-atfr-fog">
          <h2 className="font-display text-lg text-atfr-bone">Rôles disponibles</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ALL_ROLES.map((r) => (
              <li key={r} className="flex items-start gap-3">
                <Badge variant="gold" className="shrink-0 min-w-[90px] justify-center">
                  {ROLE_LABELS[r]}
                </Badge>
                <span className="leading-snug">{ROLE_DESCRIPTIONS[r]}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {users.isError && (
        <Alert tone="danger" title="Erreur">
          {(users.error as Error).message}
        </Alert>
      )}

      {users.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !users.data || users.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">Aucun utilisateur.</p>
      ) : (
        <div className="grid gap-3">
          {users.data.map((u) => {
            const isSelf = u.user_id === user?.id;
            const lastSuperAdmin =
              (users.data ?? []).filter((x) => x.role === 'super_admin')
                .length === 1 && u.role === 'super_admin';

            return (
              <Card key={u.user_id}>
                <CardBody className="p-5 flex items-center gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-atfr-bone truncate">
                        {u.email}
                      </p>
                      {isSelf && (
                        <Badge variant="outline">Moi</Badge>
                      )}
                      {u.role ? (
                        <Badge variant="gold">{ROLE_LABELS[u.role]}</Badge>
                      ) : (
                        <Badge variant="neutral">Aucun rôle</Badge>
                      )}
                    </div>
                    <p className="text-xs text-atfr-fog mt-1">
                      Créé le{' '}
                      {format(parseISO(u.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {lastSuperAdmin && (
                      <p className="text-xs text-atfr-warning mt-1 flex items-center gap-1">
                        <ShieldAlert size={12} />
                        Dernier super admin — impossible à rétrograder sans en
                        nommer un autre d'abord.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={u.role ?? ''}
                      onChange={(e) => {
                        const next = e.target.value as UserRole | '';
                        if (!next) return;
                        assign.mutate({ userId: u.user_id, role: next });
                      }}
                      disabled={assign.isPending || lastSuperAdmin}
                      className="min-w-[160px]"
                    >
                      <option value="">Choisir un rôle…</option>
                      {ALL_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </Select>
                    {u.role && (
                      <Button
                        size="sm"
                        variant="danger"
                        leadingIcon={<Trash2 size={14} />}
                        onClick={() => {
                          if (lastSuperAdmin) return;
                          if (confirm(`Retirer le rôle ${ROLE_LABELS[u.role!]} à ${u.email} ?`)) {
                            remove.mutate(u.user_id);
                          }
                        }}
                        disabled={remove.isPending || lastSuperAdmin}
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
