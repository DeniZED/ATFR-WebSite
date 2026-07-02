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

// Extrait de CwEventDetail (P2-5) : seul consommateur recharts de la page,
// chargé en lazy pour que le chunk recharts (~115 kB gzip) ne bloque pas
// l'affichage initial du détail de campagne.

const chartTooltipStyle = {
  contentStyle: {
    background: '#121316',
    border: '1px solid rgba(232,176,67,0.25)',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: '#ECECEC' },
};

interface PieDatum {
  name: string;
  value: number;
  color: string;
}

interface CwEventChartsProps {
  globalPie: PieDatum[];
  luBarData: Array<Record<string, string | number>>;
  luBattlesPie: PieDatum[];
  clanWins: number;
  clanLosses: number;
  clanWinRate: number | null;
  totalBattles: number;
}

export default function CwEventCharts({
  globalPie,
  luBarData,
  luBattlesPie,
  clanWins,
  clanLosses,
  clanWinRate,
  totalBattles,
}: CwEventChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardBody className="p-5">
          <h3 className="font-display text-lg text-atfr-bone mb-1">Résultats globaux</h3>
          <p className="text-xs text-atfr-fog mb-3">Victoires / défaites, toutes LU confondues.</p>
          {!globalPie.length ? (
            <p className="text-sm text-atfr-fog py-16 text-center">Aucun résultat saisi.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={globalPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={2}>
                    {globalPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-atfr-fog text-center mt-1">
                Total : {clanWins + clanLosses} batailles · {clanWinRate}% de victoires
              </p>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5">
          <h3 className="font-display text-lg text-atfr-bone mb-1">Résultats par LU</h3>
          <p className="text-xs text-atfr-fog mb-3">Victoires / défaites cumulées par Line-Up.</p>
          {!luBarData.length ? (
            <p className="text-sm text-atfr-fog py-16 text-center">Aucune LU créée.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={luBarData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#1C1D22" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA0AA" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="#9CA0AA" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={28} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Victoires" fill="#3FA55A" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Défaites" fill="#D2453A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-5">
          <h3 className="font-display text-lg text-atfr-bone mb-1">Batailles par LU</h3>
          <p className="text-xs text-atfr-fog mb-3">Part de chaque LU dans le volume total.</p>
          {!luBattlesPie.length ? (
            <p className="text-sm text-atfr-fog py-16 text-center">Aucune bataille saisie.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={luBattlesPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={2}>
                    {luBattlesPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-atfr-fog text-center mt-1">Total : {totalBattles} batailles</p>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
