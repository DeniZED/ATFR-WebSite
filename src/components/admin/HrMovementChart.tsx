import { useMemo } from 'react';
import {
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
import type { ActivityPeriod } from '@/features/rh/activity';
import type { ClanMemberMovementRow } from '@/types/database';

interface DayPoint {
  label: string;
  arrivals: number;
  departures: number; // stocké négatif pour l'affichage en miroir
  net: number;
}

/**
 * Mouvements du clan (arrivées / départs / solde net) sur la période —
 * volontairement SÉPARÉ de l'activité WoT/vocal (unités différentes).
 */
export function HrMovementChart({
  movements = [],
  period,
}: {
  movements?: ClanMemberMovementRow[];
  period: ActivityPeriod;
}) {
  const { data, arrivals, departures, untriaged } = useMemo(() => {
    const buckets = new Map<string, DayPoint>();
    const cursor = new Date(period.from);
    while (cursor <= period.to) {
      const key = cursor.toISOString().slice(0, 10);
      buckets.set(key, {
        label: new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        }).format(cursor),
        arrivals: 0,
        departures: 0,
        net: 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    let arrivals = 0;
    let departures = 0;
    let untriaged = 0;
    for (const m of movements) {
      const key = (m.occurred_at ?? '').slice(0, 10);
      const bucket = buckets.get(key);
      if (m.contact_status === 'new') untriaged += 1;
      if (m.event === 'join') {
        arrivals += 1;
        if (bucket) {
          bucket.arrivals += 1;
          bucket.net += 1;
        }
      } else if (m.event === 'leave') {
        departures += 1;
        if (bucket) {
          bucket.departures -= 1;
          bucket.net -= 1;
        }
      }
    }
    return { data: [...buckets.values()], arrivals, departures, untriaged };
  }, [movements, period]);

  const net = arrivals - departures;

  return (
    <Card>
      <CardBody className="p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg text-atfr-bone">
            Mouvements du clan ({period.days} jours)
          </h3>
          <p className="text-xs text-atfr-fog">
            <span className="text-atfr-success">+{arrivals}</span> arrivées ·{' '}
            <span className="text-atfr-danger">-{departures}</span> départs · solde{' '}
            <span className={net >= 0 ? 'text-atfr-success' : 'text-atfr-danger'}>
              {net >= 0 ? '+' : ''}
              {net}
            </span>
            {untriaged > 0 ? ` · ${untriaged} à trier` : ''}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
            stackOffset="sign"
          >
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
              dataKey="arrivals"
              name="Arrivées"
              stackId="mov"
              fill="#3FA55A"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="departures"
              name="Départs"
              stackId="mov"
              fill="#C0392B"
              radius={[0, 0, 3, 3]}
            />
            <Line
              type="monotone"
              dataKey="net"
              name="Solde net"
              stroke="#E8B043"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
