import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardBody } from '@/components/ui';
import { STATUS_LABELS, type PlayerActivitySummary } from '@/features/rh/activity';
import type { PlayerHrStatus } from '@/types/database';

const STATUS_COLORS: Record<PlayerHrStatus, string> = {
  active: '#3FA55A',
  low_activity: '#D89A27',
  inactive: '#D2453A',
  watch: '#E8B043',
  prospect: '#9CA0AA',
  former: '#262830',
};

const SEVERITY_COLORS: Record<string, string> = {
  info: '#9CA0AA',
  warning: '#D89A27',
  danger: '#D2453A',
};

const SEVERITY_LABELS: Record<string, string> = {
  info: 'Info',
  warning: 'Avertissement',
  danger: 'Critique',
};

export function HrStatusBreakdown({
  players,
}: {
  players: PlayerActivitySummary[];
}) {
  const statusData = useMemo(() => {
    const counts = new Map<PlayerHrStatus, number>();
    for (const summary of players) {
      counts.set(summary.player.status, (counts.get(summary.player.status) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        name: STATUS_LABELS[status],
        value: count,
        color: STATUS_COLORS[status],
      }));
  }, [players]);

  const alertData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const summary of players) {
      for (const alert of summary.activeAlerts) {
        counts.set(alert.severity, (counts.get(alert.severity) ?? 0) + 1);
      }
    }
    return ['info', 'warning', 'danger']
      .map((severity) => ({
        severity,
        name: SEVERITY_LABELS[severity],
        value: counts.get(severity) ?? 0,
      }))
      .filter((row) => row.value > 0);
  }, [players]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardBody className="p-5">
          <h3 className="font-display text-lg text-atfr-bone mb-4">
            Répartition des statuts
          </h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-atfr-fog">Pas de données.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#121316',
                    border: '1px solid rgba(232,176,67,0.25)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5">
          <h3 className="font-display text-lg text-atfr-bone mb-4">
            Alertes par sévérité
          </h3>
          {alertData.length === 0 ? (
            <p className="text-sm text-atfr-fog">Aucune alerte active.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={alertData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#1C1D22" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA0AA"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA0AA"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#121316',
                    border: '1px solid rgba(232,176,67,0.25)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" name="Alertes" radius={[4, 4, 0, 0]}>
                  {alertData.map((entry) => (
                    <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
