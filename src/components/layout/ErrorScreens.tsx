import { Component, type ReactNode } from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorMessage, isChunkLoadError } from '@/lib/chunk-error';

/**
 * Écrans d'erreur du site (jusque-là absents : un composant qui plante
 * affichait une page blanche). Deux points d'entrée :
 *   - RouteErrorBoundary : branché en `errorElement` du router. Attrape les
 *     erreurs de rendu d'une page ET les échecs de chargement de chunk lazy
 *     (typiques juste après un déploiement, quand l'ancien hash n'existe
 *     plus). Dans ce dernier cas on propose un rechargement, qui récupère
 *     la nouvelle version.
 *   - AppErrorBoundary : class boundary de dernier recours autour des
 *     providers (hors router), pour ne jamais retomber sur du blanc.
 *
 * CrashScreen est volontairement sans dépendance au contexte router
 * (liens en <a>, pas de <Link>) pour rester affichable même si le router
 * lui-même n'est pas monté.
 */

interface CrashScreenProps {
  title: string;
  message: string;
  /** Détail technique affiché en dev uniquement. */
  detail?: string;
}

function CrashScreen({ title, message, detail }: CrashScreenProps) {
  const isDev = import.meta.env.DEV;
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-atfr-gold/40 bg-atfr-gold/10 text-atfr-gold"
        aria-hidden
      >
        <AlertTriangle size={30} strokeWidth={1.6} />
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold/80">
        Transmission interrompue
      </p>
      <h1 className="mt-3 font-display text-3xl text-atfr-bone sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-atfr-fog">{message}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-atfr-gold-light to-atfr-gold px-5 py-2.5 font-display text-sm uppercase tracking-wide text-atfr-ink transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw size={15} />
          Recharger la page
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-atfr-gold/35 bg-atfr-graphite/40 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-atfr-bone transition-colors hover:border-atfr-gold/60"
        >
          <Home size={15} />
          Retour au QG
        </a>
      </div>

      {isDev && detail && (
        <pre className="mt-8 max-w-xl overflow-x-auto rounded-lg border border-atfr-gold/15 bg-atfr-carbon/80 p-4 text-left text-xs text-atfr-fog">
          {detail}
        </pre>
      )}
    </div>
  );
}

/** Branché en `errorElement` du router. */
export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isChunkLoadError(error)) {
    return (
      <CrashScreen
        title="Nouvelle version disponible"
        message="Le site a été mis à jour pendant ta visite. Recharge la page pour récupérer la dernière version."
        detail={errorMessage(error)}
      />
    );
  }

  return (
    <CrashScreen
      title="Un imprévu sur le terrain"
      message="Une erreur inattendue est survenue sur cette page. Recharge pour réessayer, ou reviens au QG."
      detail={errorMessage(error)}
    />
  );
}

interface AppErrorBoundaryState {
  error: Error | null;
}

/** Class boundary de dernier recours (hors router). */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Point de branchement pour un futur reporting (Sentry, etc.).
    console.error('[AppErrorBoundary]', error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <CrashScreen
          title="Un imprévu sur le terrain"
          message="Une erreur inattendue est survenue. Recharge la page pour repartir du bon pied."
          detail={this.state.error.message}
        />
      );
    }
    return this.props.children;
  }
}
