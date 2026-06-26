import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PlayerActivitySummary } from '@/features/rh/activity';
import type { ActivityPeriod } from '@/features/rh/activity';
import { Card, CardBody } from '@/components/ui';

interface DayPoint {
  date: string;
  label: string;
  activePlayers: number;
  battles: number;
  voiceMinutes: number;
}

export function HrTrendChart({
  players,
  period,
}: {
  players: PlayerActivitySummary[];
  period: ActivityPeriod;
}) {
  const data = useMemo(() => buildDailySeries(players, period), [players, period]);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-display text-lg text-atfr-bone">
            Tendance d'activité ({period.days} jours)
          </h3>
          <p className="text-xs text-atfr-fog">
            Joueurs actifs / jour, batailles, vocal
          </p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="hrActiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8B043" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#E8B043" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1C1D22" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#9CA0AA"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#9CA0AA"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: '#121316',
                border: '1px solid rgba(232,176,67,0.25)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: '#ECECEC' }}
            />
            <Area
              type="monotone"
              dataKey="activePlayers"
              name="Joueurs actifs"
              stroke="#E8B043"
              fill="url(#hrActiveGradient)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="battles"
              name="Batailles"
              stroke="#3FA55A"
              strokeWidth={1.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="voiceMinutes"
              name="Vocal (min)"
              stroke="#9CA0AA"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}

function buildDailySeries(
  players: PlayerActivitySummary[],
  period: ActivityPeriod,
): DayPoint[] {
  const buckets = new Map<string, DayPoint>();
  const cursor = new Date(period.from);
  while (cursor <= period.to) {
    const key = cursor.toISOString().slice(0, 10);
    buckets.set(key, {
      date: key,
      label: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(
        cursor,
      ),
      activePlayers: 0,
      battles: 0,
      voiceMinutes: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  for (const summary of players) {
    for (const snapshot of summary.snapshots) {
      const bucket = buckets.get(snapshot.snapshot_date);
      if (!bucket) continue;
      if (snapshot.active_day || (snapshot.battles_delta ?? 0) > 0) {
        bucket.activePlayers += 1;
      }
      bucket.battles += Math.max(0, snapshot.battles_delta ?? 0);
    }
    for (const session of summary.voiceSessions) {
      const key = (session.joined_at ?? '').slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.voiceMinutes += Math.round((session.duration_seconds ?? 0) / 60);
    }
  }

  return [...buckets.values()];
}
