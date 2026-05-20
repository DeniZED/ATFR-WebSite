import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, X, LogOut, Palette } from 'lucide-react';
import type { PlayerIdentityHook } from '@/features/identity/usePlayerIdentity';
import { usePlayerProfile } from '@/features/geoguesser/usePlayerProfile';
import {
  getNextReward,
  getUnlockById,
} from '@/features/geoguesser/playerProfile';
import {
  usePlayerModuleScores,
} from '@/features/leaderboard/queries';
import { AcademyBadge } from '@/components/geoguesser/AcademyBadge';
import { AvatarCustomizer } from '@/components/geoguesser/AvatarCustomizer';
import { ACADEMY_MODULE_CONTRIBUTIONS } from '@/features/academy/moduleContributions';

// Ensure modules register themselves
import '@/components/academy/GeoguesseurStats';

interface Props {
  open: boolean;
  onClose: () => void;
  identity: PlayerIdentityHook;
}

export function AcademyProfilePanel({ open, onClose, identity }: Props) {
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Fetch geoguesser scores to compute level accurately
  const scores = usePlayerModuleScores({
    moduleSlug: 'wot-geoguesser',
    playerAnonId: identity.id,
    playerAccountId: identity.accountId,
  });

  const profile = usePlayerProfile(identity, scores.data);

  function handleLogout() {
    identity.logoutVerified();
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-atfr-ink/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-[420px] flex flex-col bg-atfr-carbon border-l border-atfr-gold/20 shadow-2xl overflow-y-auto"
          >
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-atfr-gold/15 bg-atfr-carbon/95 backdrop-blur-sm px-5 py-4">
              <h2 className="font-display text-lg text-atfr-bone">Profil Académie</h2>
              <div className="flex items-center gap-2">
                {identity.isVerified && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-atfr-fog/20 px-2.5 py-1.5 text-xs text-atfr-fog/70 hover:text-atfr-bone hover:border-atfr-fog/50 transition-colors"
                    title="Déconnexion WG"
                  >
                    <LogOut size={12} />
                    <span className="hidden sm:inline">Déconnexion</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-atfr-gold/20 text-atfr-fog hover:text-atfr-bone hover:border-atfr-gold/50 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Avatar hero ── */}
            <div className="flex flex-col items-center gap-4 px-5 py-8 border-b border-atfr-gold/10">
              {/* Insigne de rang */}
              <AcademyBadge
                levelInfo={profile.levelInfo}
                primaryColorId={profile.avatarConfig.primaryColorId}
                accentColorId={profile.avatarConfig.accentColorId}
                emblemId={profile.avatarConfig.emblemId}
                size={148}
                className="drop-shadow-xl"
              />

              {/* Identity */}
              <div className="text-center">
                <p className="font-display text-2xl text-atfr-bone leading-tight">
                  {identity.nickname || '—'}
                </p>
                {profile.avatarConfig.titleId && (
                  <p className="text-xs text-atfr-gold/70 italic mt-0.5">
                    {getUnlockById(profile.avatarConfig.titleId)?.label}
                  </p>
                )}
                {identity.isVerified && (
                  <p className="text-xs text-atfr-success/80 uppercase tracking-wider mt-0.5">
                    Compte WG vérifié
                  </p>
                )}
              </div>

              {/* Level + XP */}
              <div className="w-full max-w-xs space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-atfr-gold">
                    Niv. {profile.levelInfo.level} — {profile.levelInfo.title}
                  </span>
                  <span className="text-xs text-atfr-fog/60">
                    {profile.levelInfo.xp.toLocaleString('fr')} XP
                  </span>
                </div>
                <div className="h-2 rounded-full bg-atfr-ink/70 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-atfr-gold/70 to-atfr-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(profile.levelInfo.progress * 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
                {!profile.levelInfo.isMax && (
                  <p className="text-[10px] text-atfr-fog/50 text-right">
                    +{profile.levelInfo.xpToNext.toLocaleString('fr')} XP → Niv. {profile.levelInfo.level + 1}
                  </p>
                )}
                {/* Next reward */}
                {(() => {
                  const next = getNextReward(profile.levelInfo.level);
                  return next ? (
                    <div className="flex items-start gap-1.5 rounded-lg bg-atfr-ink/50 border border-atfr-gold/10 px-2.5 py-1.5 mt-0.5">
                      <Gift size={11} className="text-atfr-gold/60 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-atfr-fog/60 leading-tight">
                        <span className="text-atfr-gold/80 font-medium">Niv. {next.level} :</span>{' '}
                        {next.unlocks.map((u) => u.label).join(', ')}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Customize button */}
              <button
                type="button"
                onClick={() => setShowCustomizer(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-atfr-gold/40 bg-atfr-gold/10 px-4 py-2 text-sm font-semibold text-atfr-gold hover:bg-atfr-gold/20 hover:border-atfr-gold/70 transition-all"
              >
                <Palette size={15} />
                Personnaliser l'avatar
              </button>
            </div>

            {/* ── Module stats ── */}
            <div className="flex-1 px-5 py-5 space-y-6">
              {ACADEMY_MODULE_CONTRIBUTIONS.length === 0 ? (
                <p className="text-xs text-atfr-fog/50 italic">Aucun module disponible.</p>
              ) : (
                ACADEMY_MODULE_CONTRIBUTIONS.map(({ slug, label, StatsComponent }) => (
                  <section key={slug}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/70 mb-3">
                      {label}
                    </h3>
                    <StatsComponent identity={identity} />
                  </section>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Avatar Customizer modal (above the panel) */}
      {showCustomizer && open && (
        <AvatarCustomizer
          config={profile.avatarConfig}
          levelInfo={profile.levelInfo}
          onSave={profile.updateAvatarConfig}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
