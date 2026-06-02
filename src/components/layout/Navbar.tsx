import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LogIn, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { usePlayerProfile } from '@/features/geoguesser/usePlayerProfile';
import { AcademyBadge } from '@/components/geoguesser/AcademyBadge';
import { AcademyProfilePanel } from '@/components/academy/AcademyProfilePanel';
import { Button } from '@/components/ui/Button';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/membres', label: 'Membres' },
  { to: '/evenements', label: 'Événements' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/modules', label: 'Académie' },
  { to: '/recrutement', label: 'Recrutement' },
];

function WgProfileBubble() {
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

export function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-atfr-ink/80 backdrop-blur-lg border-b border-atfr-gold/10'
          : 'bg-transparent',
      )}
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={`https://eu.wargaming.net/clans/media/clans/emblems/cl_501/${env.clanId}/emblem_64x64.png`}
            alt={`Logo ${env.clanTag}`}
            width={40}
            height={40}
            className="h-10 w-10 drop-shadow-[0_0_10px_rgba(232,176,67,0.35)] transition-transform group-hover:scale-105"
          />
          <div>
            <p className="font-display text-lg leading-none text-atfr-bone tracking-widest">
              {env.clanTag}
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-atfr-gold/80">
              Clan WoT
            </p>
          </div>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-md',
                  isActive
                    ? 'text-atfr-gold'
                    : 'text-atfr-fog hover:text-atfr-bone',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <WgProfileBubble />
          <Link to="/recrutement">
            <Button size="sm">Postuler</Button>
          </Link>
        </div>

        <button
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-atfr-bone"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:hidden overflow-hidden border-t border-atfr-gold/10 bg-atfr-ink/95 backdrop-blur-lg"
          >
            <nav aria-label="Navigation mobile" className="container py-4 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-2 rounded-md text-sm',
                      isActive
                        ? 'text-atfr-gold bg-atfr-gold/10'
                        : 'text-atfr-fog hover:text-atfr-bone',
                    )
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user && (
                <Link to="/admin" className="px-3 py-2 text-sm text-atfr-fog/60 hover:text-atfr-bone transition-colors">
                  Administration
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
