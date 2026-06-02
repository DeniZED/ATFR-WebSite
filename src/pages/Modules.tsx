import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, GraduationCap, Hourglass, Lock, LogIn, Users } from 'lucide-react';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { usePublishedModules } from '@/features/modules/queries';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { useClanMembership } from '@/features/clan/useClanMembership';

const CATEGORY_LABEL = {
  pédagogie: 'Pédagogique',
  jeu: 'Jeu',
  outil: 'Outil',
} as const;

function AcademyHero() {
  const identity = usePlayerIdentity();
  const { isMember } = useClanMembership();

  return (
    <div className="relative overflow-hidden py-16 sm:py-24">
      {/* Fond dégradé hero */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(900px 400px at 60% 0%, rgba(232,176,67,0.10), transparent 70%), radial-gradient(600px 300px at 0% 50%, rgba(232,176,67,0.05), transparent 70%)',
        }}
      />
      {/* Grille subtile */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-30 bg-grid bg-grid"
        aria-hidden
      />

      <div className="container">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-atfr-gold/30 bg-atfr-gold/10 px-3 py-1 mb-6">
              <GraduationCap size={13} className="text-atfr-gold" strokeWidth={2} />
              <span className="text-[11px] uppercase tracking-[0.3em] text-atfr-gold/90 font-medium">
                ATFR Academy
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-atfr-bone leading-[1.05] tracking-tight">
              Progresser.
              <br />
              <span className="text-atfr-gold">Jouer.</span>
              <br />
              Partager.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-atfr-fog leading-relaxed max-w-xl">
              Modules pédagogiques et mini-jeux communautaires autour de World of Tanks.
              Ouvert à tous les joueurs — membres {env.clanTag} ou non.
            </p>

            {/* CTA connexion si non connecté */}
            {!identity.isVerified && env.wotApplicationId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => identity.startWgLogin()}
                  className="inline-flex items-center gap-2 rounded-xl bg-atfr-gold px-5 py-2.5 text-sm font-semibold text-atfr-ink hover:bg-atfr-gold-light transition-colors"
                >
                  <LogIn size={15} />
                  Connexion avec Wargaming
                </button>
                <span className="text-xs text-atfr-fog/60">
                  Pour sauvegarder tes scores et accéder au classement
                </span>
              </motion.div>
            )}

            {/* Badge membre ATFR si connecté et membre */}
            {identity.isVerified && isMember && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-atfr-gold/40 bg-atfr-gold/10 px-3 py-1.5"
              >
                <Users size={12} className="text-atfr-gold" />
                <span className="text-xs font-semibold text-atfr-gold">
                  Membre {env.clanTag} — accès complet
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function Modules() {
  const { data, isLoading } = usePublishedModules();

  return (
    <>
      <AcademyHero />

      <div className="container pb-24">
        <div className="mb-8 flex items-center gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-atfr-gold/70 font-medium">
            Modules disponibles
          </p>
          <div className="flex-1 h-px bg-atfr-gold/10" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-atfr-fog py-20">
            Aucun module disponible pour le moment. Revenez bientôt.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.map(({ registry, row }, i) => {
              const title = row.custom_title || registry.title;
              const description = row.custom_description || registry.description;
              const Icon = registry.icon;
              return (
                <motion.div
                  key={registry.slug}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.06,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                >
                  <Link
                    to={`/modules/${registry.path}`}
                    className={cn(
                      'group relative flex h-full flex-col overflow-hidden rounded-xl border bg-atfr-carbon p-6 transition-all',
                      'hover:-translate-y-1 hover:border-atfr-gold/60',
                      registry.accentBorder,
                    )}
                  >
                    <div
                      className={cn(
                        'absolute inset-x-0 top-0 h-32 bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity',
                        registry.accentGradient,
                      )}
                      aria-hidden
                    />

                    <div className="relative flex items-start justify-between gap-3 mb-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-atfr-gold/40 bg-atfr-ink/80 text-atfr-gold">
                        <Icon size={22} strokeWidth={1.6} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-atfr-fog">
                          {CATEGORY_LABEL[registry.category]}
                        </span>
                        {registry.membersOnly ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                            <Lock size={10} />
                            Membres {env.clanTag}
                          </span>
                        ) : (
                          row.badge_label && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-atfr-gold/15 border border-atfr-gold/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-atfr-gold">
                              {row.badge_label}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <div className="relative flex-1">
                      <h3 className="font-display text-2xl text-atfr-bone mb-2">
                        {title}
                      </h3>
                      <p className="text-sm text-atfr-fog leading-relaxed">
                        {description}
                      </p>
                    </div>

                    <div className="relative mt-6 flex items-center justify-between text-sm">
                      {registry.comingSoon ? (
                        <span className="inline-flex items-center gap-1.5 text-atfr-fog">
                          <Hourglass size={14} />
                          Bientôt disponible
                        </span>
                      ) : (
                        <span className="font-medium text-atfr-gold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          {registry.cta}
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
