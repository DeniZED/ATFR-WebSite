import { useMemo } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardBody } from '@/components/ui';
import type {
  ActivityPeriod,
  PlayerActivitySummary,
} from '@/features/rh/activity';

interface DayPoint {
  label: string;
  activePlayers: number;
  battles: number;
  voiceHours: number;
}

/**
 * Activité WoT vs Discord dans le temps, avec des unités LISIBLES et séparées :
 *   - axe gauche : joueurs actifs (nb) + vocal (heures) — mêmes ordres de grandeur ;
 *   - axe droit  : batailles/jour (compte, souvent en centaines).
 * Plus de mélange batailles/minutes sur un même axe.
 */
export function HrActivityTrendChart({
  players,
  period,
}: {
  players: PlayerActivitySummary[];
  period: ActivityPeriod;
}) {
  const { data, avgActive, battlesPerActive, hoursPerLinked } = useMemo(() => {
    const buckets = new Map<string, DayPoint>();
    const cursor = new Date(period.from);
    while (cursor <= period.to) {
      const key = cursor.toISOString().slice(0, 10);
      buckets.set(key, {
        label: new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        }).format(cursor),
        activePlayers: 0,
        battles: 0,
        voiceHours: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    let totalBattles = 0;
    let totalVoiceSeconds = 0;
    let linkedCount = 0;
    for (const summary of players) {
      if (summary.discordLink) linkedCount += 1;
      for (const snap of summary.snapshots) {
        const bucket = buckets.get(snap.snapshot_date);
        if (!bucket) continue;
        if (snap.active_day || (snap.battles_delta ?? 0) > 0) {
          bucket.activePlayers += 1;
        }
        const b = Math.max(0, snap.battles_delta ?? 0);
        bucket.battles += b;
        totalBattles += b;
      }
      for (const session of summary.voiceSessions) {
        const key = (session.joined_at ?? '').slice(0, 10);
        const bucket = buckets.get(key);
        const secs = session.duration_seconds ?? 0;
        totalVoiceSeconds += secs;
        if (bucket) bucket.voiceHours += secs / 3600;
      }
    }

    const data = [...buckets.values()].map((d) => ({
      ...d,
      voiceHours: Math.round(d.voiceHours * 10) / 10,
    }));
    const activeSum = data.reduce((s, d) => s + d.activePlayers, 0);
    return {
      data,
      avgActive: data.length > 0 ? Math.round(activeSum / data.length) : 0,
      battlesPerActive:
        activeSum > 0 ? Math.round(totalBattles / activeSum) : 0,
      hoursPerLinked:
        linkedCount > 0
          ? Math.round((totalVoiceSeconds / 3600 / linkedCount) * 10) / 10
          : 0,
    };
  }, [players, period]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardBody className="p-5">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-atfr-bone">
            Activité WoT &amp; Discord ({period.days} jours)
          </h3>
        </div>
        <p className="mb-4 text-xs text-atfr-fog">
          ~{avgActive} actifs/jour · {battlesPerActive} batailles/joueur actif ·{' '}
          {hoursPerLinked} h vocal/joueur lié
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="hrActiveGrad" x1="0" y1="0" x2="0" y2="1">
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
              yAxisId="left"
              stroke="#9CA0AA"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#3FA55A"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={34}
              allowDecimals={false}
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              yAxisId="right"
              dataKey="battles"
              name="Batailles"
              fill="#3FA55A"
              barSize={12}
              radius={[3, 3, 0, 0]}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="activePlayers"
              name="Joueurs actifs"
              stroke="#E8B043"
              fill="url(#hrActiveGrad)"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="voiceHours"
              name="Vocal (h)"
              stroke="#9CA0AA"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
