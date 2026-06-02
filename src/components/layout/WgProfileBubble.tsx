import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { env } from '@/lib/env';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { usePlayerProfile } from '@/features/geoguesser/usePlayerProfile';
import { AcademyBadge } from '@/components/geoguesser/AcademyBadge';
import { AcademyProfilePanel } from '@/components/academy/AcademyProfilePanel';

export function WgProfileBubble() {
  const identity = usePlayerIdentity();
  const profile = usePlayerProfile(identity, undefined);
  const [open, setOpen] = useState(false);

  if (!env.wotApplicationId) return null;

  return (
    <>
      {identity.isVerified ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2 rounded-xl border border-atfr-gold/30 bg-atfr-graphite/60 px-2 py-1.5 hover:border-atfr-gold/70 hover:bg-atfr-graphite/90 transition-all"
          title="Mon profil"
        >
          <div className="w-10 h-[30px] flex items-center justify-center overflow-visible">
            <AcademyBadge
              levelInfo={profile.levelInfo}
              primaryColorId={profile.avatarConfig.primaryColorId}
              size={34}
            />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-atfr-bone leading-none truncate max-w-[120px]">
              {identity.nickname}
            </p>
            <p className="text-[10px] text-atfr-gold/70 mt-0.5">
              Niv. {profile.levelInfo.level}
            </p>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => identity.startWgLogin()}
          className="inline-flex items-center gap-2 rounded-xl border border-atfr-gold/40 bg-atfr-gold/10 px-3 py-2 text-sm font-semibold text-atfr-gold hover:bg-atfr-gold/20 hover:border-atfr-gold/70 transition-all"
        >
          <LogIn size={15} />
          Connexion WG
        </button>
      )}

      <AcademyProfilePanel open={open} onClose={() => setOpen(false)} identity={identity} />
    </>
  );
}
