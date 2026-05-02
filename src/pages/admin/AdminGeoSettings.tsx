import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';
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
  useResetAllShotStats,
  useUpdateGeoSettings,
} from '@/features/geoguesser/queries';

export default function AdminGeoSettings() {
  const settings = useGeoSettings();
  const update = useUpdateGeoSettings();
  const resetAllStats = useResetAllShotStats();

  const [roundTime, setRoundTime] = useState<number>(45);
  const [wrongMap, setWrongMap] = useState<number>(2000);
  const [timeout, setTimeoutMalus] = useState<number>(2000);
  const [dailyRounds, setDailyRounds] = useState<number>(5);
  const [randomRounds, setRandomRounds] = useState<number>(5);
  const [sprintRounds, setSprintRounds] = useState<number>(10);
  const [sprintRoundTime, setSprintRoundTime] = useState<number>(20);
  const [sprintPenalty, setSprintPenalty] = useState<number>(12);
  const [blindRounds, setBlindRounds] = useState<number>(5);
  const [blindPreview, setBlindPreview] = useState<number>(5);
  const [minMapsDaily, setMinMapsDaily] = useState<number>(5);
  const [minMapsRandom, setMinMapsRandom] = useState<number>(5);
  const [minMapsSprint, setMinMapsSprint] = useState<number>(10);
  const [minMapsBlind, setMinMapsBlind] = useState<number>(5);
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (settings.data) {
      setRoundTime(settings.data.round_time_s);
      setWrongMap(settings.data.wrong_map_malus_m);
      setTimeoutMalus(settings.data.timeout_malus_m);
      setDailyRounds(settings.data.daily_challenge_rounds ?? 5);
      setRandomRounds(settings.data.random_rounds ?? 5);
      setSprintRounds(settings.data.sprint_rounds ?? 10);
      setSprintRoundTime(settings.data.sprint_round_time_s ?? 20);
      setSprintPenalty(settings.data.sprint_time_penalty_m ?? 12);
      setBlindRounds(settings.data.blind_rounds ?? 5);
      setBlindPreview(settings.data.blind_preview_seconds ?? 5);
      setMinMapsDaily(settings.data.min_maps_daily ?? 5);
      setMinMapsRandom(settings.data.min_maps_random ?? 5);
      setMinMapsSprint(settings.data.min_maps_sprint ?? 10);
      setMinMapsBlind(settings.data.min_maps_blind ?? 5);
    }
  }, [settings.data]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    await update.mutateAsync({
      round_time_s: roundTime,
      wrong_map_malus_m: wrongMap,
      timeout_malus_m: timeout,
      daily_challenge_rounds: dailyRounds,
      random_rounds: randomRounds,
      sprint_rounds: sprintRounds,
      sprint_round_time_s: sprintRoundTime,
      sprint_time_penalty_m: sprintPenalty,
      blind_rounds: blindRounds,
      blind_preview_seconds: blindPreview,
      min_maps_daily: minMapsDaily,
      min_maps_random: minMapsRandom,
      min_maps_sprint: minMapsSprint,
      min_maps_blind: minMapsBlind,
    });
    setSaved(true);
  }

  async function resetAllGeoguesserStats() {
    if (
      !confirm(
        'Réinitialiser toutes les stats GeoGuesseur ? Tous les compteurs repassent à 0 et toutes les difficultés redeviennent Facile.',
      )
    ) {
      return;
    }
    const affected = await resetAllStats.mutateAsync();
    setResetMessage(
      `${affected} screenshot(s) réinitialisé(s). Les difficultés sont repassées en Facile.`,
    );
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
            <form onSubmit={save} className="space-y-6">
              <SettingsSection
                title="Score global"
                description="Paramètres utilisés par les modes standard, le défi du jour et les malus."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Input
                    label="Timer standard (s)"
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
                </div>
              </SettingsSection>

              <SettingsSection
                title="Modes de jeu"
                description="Le minimum de maps contrôle quelles difficultés sont disponibles côté joueur."
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <ModeSettingsBlock
                    title="Challenge du jour"
                    description="Même sélection quotidienne pour tout le clan."
                  >
                    <Input
                      label="Screens défi du jour"
                      type="number"
                      min={1}
                      max={20}
                      value={dailyRounds}
                      onChange={(e) => setDailyRounds(Number(e.target.value))}
                    />
                    <Input
                      label="Minimum maps"
                      type="number"
                      min={1}
                      max={100}
                      value={minMapsDaily}
                      onChange={(e) => setMinMapsDaily(Number(e.target.value))}
                    />
                  </ModeSettingsBlock>

                  <ModeSettingsBlock
                    title="Série libre"
                    description="Pool aléatoire pour l'entraînement classique."
                  >
                    <Input
                      label="Manches"
                      type="number"
                      min={1}
                      max={20}
                      value={randomRounds}
                      onChange={(e) => setRandomRounds(Number(e.target.value))}
                    />
                    <Input
                      label="Minimum maps"
                      type="number"
                      min={1}
                      max={100}
                      value={minMapsRandom}
                      onChange={(e) => setMinMapsRandom(Number(e.target.value))}
                    />
                  </ModeSettingsBlock>

                  <ModeSettingsBlock
                    title="Sprint"
                    description="Mode rapide avec pénalité chrono sur bonne map."
                  >
                    <Input
                      label="Manches"
                      type="number"
                      min={1}
                      max={30}
                      value={sprintRounds}
                      onChange={(e) => setSprintRounds(Number(e.target.value))}
                    />
                    <Input
                      label="Timer sprint (s)"
                      type="number"
                      min={5}
                      max={120}
                      value={sprintRoundTime}
                      onChange={(e) =>
                        setSprintRoundTime(Number(e.target.value))
                      }
                    />
                    <Input
                      label="Pénalité chrono (m/s)"
                      type="number"
                      min={0}
                      max={1000}
                      value={sprintPenalty}
                      onChange={(e) => setSprintPenalty(Number(e.target.value))}
                    />
                    <Input
                      label="Minimum maps"
                      type="number"
                      min={1}
                      max={100}
                      value={minMapsSprint}
                      onChange={(e) => setMinMapsSprint(Number(e.target.value))}
                    />
                  </ModeSettingsBlock>

                  <ModeSettingsBlock
                    title="Blind Guess"
                    description="Le screenshot disparaît après la prévisualisation."
                  >
                    <Input
                      label="Manches"
                      type="number"
                      min={1}
                      max={20}
                      value={blindRounds}
                      onChange={(e) => setBlindRounds(Number(e.target.value))}
                    />
                    <Input
                      label="Preview screen (s)"
                      type="number"
                      min={1}
                      max={60}
                      value={blindPreview}
                      onChange={(e) => setBlindPreview(Number(e.target.value))}
                    />
                    <Input
                      label="Minimum maps"
                      type="number"
                      min={1}
                      max={100}
                      value={minMapsBlind}
                      onChange={(e) => setMinMapsBlind(Number(e.target.value))}
                    />
                  </ModeSettingsBlock>
                </div>
              </SettingsSection>

              <p className="text-xs text-atfr-fog">
                Le score d'une manche est la distance réelle (en mètres) entre
                le pick joueur et le shot. Mauvaise map → +malus. Pas de pick
                avant la fin du timer → +malus time out. Le but est d'avoir le
                score TOTAL le plus bas possible.
              </p>
              {saved && (
                <Alert tone="success">Paramètres enregistrés.</Alert>
              )}
              {update.isError && (
                <Alert tone="danger">
                  {(update.error as Error).message}
                </Alert>
              )}
              <div className="flex justify-end">
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

      {!settings.isLoading && !settings.isError && (
        <Card>
          <CardBody className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-display text-lg text-atfr-bone">
                  Réinitialisation des stats
                </p>
                <p className="text-sm text-atfr-fog mt-1">
                  Remet tous les screenshots à 0 tentative, 0 bonne map, 0 perf
                  cumulée, et repasse leur difficulté en Facile. L'adaptation
                  automatique reprendra ensuite toutes les 10 tentatives.
                </p>
              </div>
              <Button
                variant="danger"
                leadingIcon={<RotateCcw size={14} />}
                onClick={resetAllGeoguesserStats}
                disabled={resetAllStats.isPending}
              >
                {resetAllStats.isPending
                  ? 'Réinitialisation...'
                  : 'Reset toutes les stats'}
              </Button>
            </div>
            {resetMessage && <Alert tone="success">{resetMessage}</Alert>}
            {resetAllStats.isError && (
              <Alert tone="danger">
                {(resetAllStats.error as Error).message}
              </Alert>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="font-display text-lg text-atfr-bone">{title}</p>
        <p className="text-sm text-atfr-fog mt-1">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ModeSettingsBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-atfr-gold/15 bg-atfr-graphite/35 p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-atfr-bone">{title}</p>
        <p className="text-xs text-atfr-fog mt-1">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}
