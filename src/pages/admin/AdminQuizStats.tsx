import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Crosshair,
  Flame,
  Pencil,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Alert,
  Badge,
  Card,
  CardBody,
  Spinner,
  StatCard,
} from '@/components/ui';
import { useQuizQuestions, useQuizSessions } from '@/features/quiz/queries';
import { DIFFICULTY_LABELS } from '@/types/database';

const MIN_ATTEMPTS_FOR_RANKING = 3;

export default function AdminQuizStats() {
  const questions = useQuizQuestions();
  const sessions = useQuizSessions(300);

  const summary = useMemo(() => {
    const all = sessions.data ?? [];
    const finished = all.filter(
      (s) => s.finished_at != null && s.score != null && s.total != null,
    );
    const avgScorePct =
      finished.length > 0
        ? finished.reduce(
            (acc, s) => acc + (s.score! / Math.max(s.total!, 1)) * 100,
            0,
          ) / finished.length
        : null;
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const startedToday = all.filter(
      (s) => new Date(s.started_at).getTime() >= dayAgo,
    ).length;
    const startedWeek = all.filter(
      (s) => new Date(s.started_at).getTime() >= weekAgo,
    ).length;
    return {
      totalSessions: all.length,
      finishedSessions: finished.length,
      avgScorePct,
      startedToday,
      startedWeek,
    };
  }, [sessions.data]);

  const worstQuestions = useMemo(() => {
    if (!questions.data) return [];
    return [...questions.data]
      .filter((q) => q.attempt_count >= MIN_ATTEMPTS_FOR_RANKING)
      .map((q) => ({
        ...q,
        successRate: q.attempt_count > 0 ? q.success_count / q.attempt_count : 0,
      }))
      .sort((a, b) => a.successRate - b.successRate)
      .slice(0, 8);
  }, [questions.data]);

  const mostAttempted = useMemo(() => {
    if (!questions.data) return [];
    return [...questions.data]
      .filter((q) => q.attempt_count > 0)
      .sort((a, b) => b.attempt_count - a.attempt_count)
      .slice(0, 8);
  }, [questions.data]);

  const sparkline = useMemo(() => {
    if (!sessions.data) return [];
    const days: Array<{ day: string; count: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = sessions.data.filter((s) => {
        const t = new Date(s.started_at);
        return t >= d && t < next;
      }).length;
      days.push({ day: format(d, 'dd/MM', { locale: fr }), count });
    }
    return days;
  }, [sessions.data]);

  const max = Math.max(1, ...sparkline.map((d) => d.count));
  const isLoading = questions.isLoading || sessions.isLoading;
  const isError = questions.isError || sessions.isError;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/quiz"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> Retour aux questions
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Académie · Guide pour les bots
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">
          Statistiques & analyse
        </h1>
      </div>

      {isError && (
        <Alert tone="danger" title="Erreur de chargement">
          Impossible de récupérer les données.
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Sessions totales"
              value="—"
              animateTo={summary.totalSessions}
              icon={<Users size={20} />}
            />
            <StatCard
              label="Sessions 24h"
              value="—"
              animateTo={summary.startedToday}
              icon={<Flame size={20} />}
              hint={`${summary.startedWeek} sur 7 jours`}
            />
            <StatCard
              label="Sessions terminées"
              value="—"
              animateTo={summary.finishedSessions}
              icon={<Target size={20} />}
              hint={
                summary.totalSessions > 0
                  ? `${Math.round((summary.finishedSessions / summary.totalSessions) * 100)}% de complétion`
                  : undefined
              }
            />
            <StatCard
              label="Score moyen"
              value="—"
              animateTo={summary.avgScorePct}
              decimals={0}
              suffix="%"
              icon={<Crosshair size={20} />}
            />
          </div>

          {/* Sparkline 14 jours */}
          <Card>
            <CardBody className="p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-4">
                Sessions par jour · 14 derniers jours
              </p>
              <div className="flex items-end gap-1 h-24">
                {sparkline.map((d) => (
                  <div
                    key={d.day}
                    className="flex-1 flex flex-col items-center justify-end gap-1"
                    title={`${d.day} : ${d.count}`}
                  >
                    <div
                      className="w-full rounded-sm bg-atfr-gold/60 hover:bg-atfr-gold transition-colors"
                      style={{
                        height: `${Math.max(2, (d.count / max) * 100)}%`,
                      }}
                    />
                    <span className="text-[9px] text-atfr-fog">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Two columns: worst + most attempted */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardBody className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown size={16} className="text-atfr-danger" />
                  <h2 className="font-display text-lg text-atfr-bone">
                    Questions les plus ratées
                  </h2>
                </div>
                <p className="text-xs text-atfr-fog mb-3">
                  Au moins {MIN_ATTEMPTS_FOR_RANKING} essais. Indice qu'il
                  faudrait peut-être clarifier l'énoncé ou l'explication.
                </p>
                {worstQuestions.length === 0 ? (
                  <p className="text-sm text-atfr-fog py-8 text-center">
                    Pas encore assez de réponses pour classer.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {worstQuestions.map((q) => (
                      <Link
                        key={q.id}
                        to={`/admin/quiz/${q.id}`}
                        className="flex items-center gap-3 rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 p-3 hover:border-atfr-gold/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-atfr-bone truncate">
                            {q.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline">
                              {DIFFICULTY_LABELS[q.difficulty]}
                            </Badge>
                            <span className="text-xs text-atfr-fog">
                              {q.attempt_count} essai{q.attempt_count > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display text-2xl text-atfr-danger">
                            {Math.round(q.successRate * 100)}
                            <span className="text-base text-atfr-fog">%</span>
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                            de réussite
                          </p>
                        </div>
                        <Pencil
                          size={14}
                          className="text-atfr-gold/60 shrink-0"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-atfr-success" />
                  <h2 className="font-display text-lg text-atfr-bone">
                    Questions les plus jouées
                  </h2>
                </div>
                <p className="text-xs text-atfr-fog mb-3">
                  Sur la base de toutes les réponses enregistrées.
                </p>
                {mostAttempted.length === 0 ? (
                  <p className="text-sm text-atfr-fog py-8 text-center">
                    Aucune session enregistrée pour le moment.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mostAttempted.map((q) => {
                      const successPct =
                        q.attempt_count > 0
                          ? Math.round(
                              (q.success_count / q.attempt_count) * 100,
                            )
                          : 0;
                      return (
                        <Link
                          key={q.id}
                          to={`/admin/quiz/${q.id}`}
                          className="flex items-center gap-3 rounded-lg border border-atfr-gold/15 bg-atfr-graphite/40 p-3 hover:border-atfr-gold/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-atfr-bone truncate">
                              {q.title}
                            </p>
                            <p className="text-xs text-atfr-fog mt-1">
                              {successPct}% de réussite
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display text-2xl text-atfr-bone">
                              {q.attempt_count}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-atfr-fog">
                              essais
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Sessions récentes */}
          <Card>
            <CardBody className="p-5">
              <h2 className="font-display text-lg text-atfr-bone mb-4">
                Sessions récentes
              </h2>
              {(sessions.data ?? []).length === 0 ? (
                <p className="text-sm text-atfr-fog py-8 text-center">
                  Aucune session encore.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] uppercase tracking-wider text-atfr-fog">
                        <th className="px-5 py-2">Démarrée</th>
                        <th className="px-5 py-2">Mode</th>
                        <th className="px-5 py-2 text-right">Score</th>
                        <th className="px-5 py-2 text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sessions.data ?? []).slice(0, 25).map((s) => {
                        const finished =
                          s.finished_at && s.score != null && s.total != null;
                        const pct =
                          finished && s.total
                            ? Math.round((s.score! / s.total) * 100)
                            : null;
                        return (
                          <tr
                            key={s.id}
                            className="border-t border-atfr-gold/10 text-atfr-bone"
                          >
                            <td className="px-5 py-2 text-atfr-fog">
                              {format(
                                parseISO(s.started_at),
                                'dd/MM HH:mm',
                                { locale: fr },
                              )}
                            </td>
                            <td className="px-5 py-2">
                              <Badge variant="outline">{s.mode}</Badge>
                            </td>
                            <td className="px-5 py-2 text-right">
                              {finished ? (
                                <span>
                                  {s.score} / {s.total}{' '}
                                  <span className="text-atfr-fog">({pct}%)</span>
                                </span>
                              ) : (
                                <span className="text-atfr-fog">—</span>
                              )}
                            </td>
                            <td className="px-5 py-2 text-right">
                              {finished ? (
                                <Badge variant="success">Terminée</Badge>
                              ) : (
                                <Badge variant="neutral">Abandonnée</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
