import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
} from '@/components/ui';
import {
  useGeoSettings,
  useUpdateGeoSettings,
} from '@/features/geoguesser/queries';

export default function AdminGeoSettings() {
  const settings = useGeoSettings();
  const update = useUpdateGeoSettings();

  const [roundTime, setRoundTime] = useState<number>(45);
  const [wrongMap, setWrongMap] = useState<number>(2000);
  const [timeout, setTimeoutMalus] = useState<number>(2000);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings.data) {
      setRoundTime(settings.data.round_time_s);
      setWrongMap(settings.data.wrong_map_malus_m);
      setTimeoutMalus(settings.data.timeout_malus_m);
    }
  }, [settings.data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    await update.mutateAsync({
      round_time_s: roundTime,
      wrong_map_malus_m: wrongMap,
      timeout_malus_m: timeout,
    });
    setSaved(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/geoguesser"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> GeoGuesser
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie · GeoGuesser
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Paramètres</h1>
        <p className="text-sm text-atfr-fog mt-1">
          Réglages globaux du module. Tous les joueurs prennent ces valeurs au
          prochain chargement de la page.
        </p>
      </div>

      {settings.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : settings.isError ? (
        <Alert tone="danger">{(settings.error as Error).message}</Alert>
      ) : (
        <Card>
          <CardBody className="p-6">
            <form onSubmit={save} className="grid gap-4 md:grid-cols-3">
              <Input
                label="Timer par manche (s)"
                type="number"
                min={5}
                max={300}
                value={roundTime}
                onChange={(e) => setRoundTime(Number(e.target.value))}
              />
              <Input
                label="Malus mauvaise map (m)"
                type="number"
                min={0}
                max={100000}
                step={100}
                value={wrongMap}
                onChange={(e) => setWrongMap(Number(e.target.value))}
              />
              <Input
                label="Malus time out (m)"
                type="number"
                min={0}
                max={100000}
                step={100}
                value={timeout}
                onChange={(e) => setTimeoutMalus(Number(e.target.value))}
              />
              <p className="md:col-span-3 text-xs text-atfr-fog">
                Le score d'une manche est la distance réelle (en mètres) entre
                le pick joueur et le shot. Mauvaise map → +malus. Pas de pick
                avant la fin du timer → +malus time out. Le but est d'avoir le
                score TOTAL le plus bas possible.
              </p>
              {saved && (
                <div className="md:col-span-3">
                  <Alert tone="success">Paramètres enregistrés.</Alert>
                </div>
              )}
              {update.isError && (
                <div className="md:col-span-3">
                  <Alert tone="danger">
                    {(update.error as Error).message}
                  </Alert>
                </div>
              )}
              <div className="md:col-span-3 flex justify-end">
                <Button
                  type="submit"
                  leadingIcon={<Save size={14} />}
                  disabled={update.isPending}
                >
                  {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
