import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookOpen, GraduationCap, Map, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useEffect } from 'react';
import { WgProfileBubble } from './WgProfileBubble';

const moduleLinks = [
  { to: '/modules', label: 'Hub', icon: GraduationCap, end: true },
  { to: '/modules/guide-bots', label: 'Guide pour les bots', icon: BookOpen },
  { to: '/modules/wot-geoguesser', label: 'WoT GeoGuesseur', icon: Map },
];

export function AcademyNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-atfr-carbon/95 backdrop-blur-lg border-b border-atfr-gold/15">
      {/* Ligne d'accent dorée en haut */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-atfr-gold/60 to-transparent" />

      <div className="container flex items-center justify-between h-16">
        {/* Logo académie */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-atfr-fog/60 hover:text-atfr-fog transition-colors"
            title="Retour au site du clan"
          >
            <ArrowLeft size={12} />
            Clan
          </Link>
          <div className="hidden sm:block w-px h-4 bg-atfr-gold/20" />
          <Link to="/modules" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-atfr-gold/15 border border-atfr-gold/30 flex items-center justify-center group-hover:bg-atfr-gold/25 transition-colors">
              <GraduationCap size={16} className="text-atfr-gold" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-display text-base leading-none text-atfr-bone tracking-wide">
                ATFR Academy
              </p>
              <p className="text-[9px] uppercase tracking-[0.3em] text-atfr-gold/70 mt-0.5">
                Communauté WoT
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation modules — desktop */}
        <nav aria-label="Modules" className="hidden lg:flex items-center gap-1">
          {moduleLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-md',
                  isActive
                    ? 'text-atfr-gold bg-atfr-gold/10'
                    : 'text-atfr-fog hover:text-atfr-bone',
                )
              }
            >
              <Icon size={14} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Droite : profil WG */}
        <div className="hidden lg:flex items-center gap-2">
          <WgProfileBubble />
        </div>

        {/* Burger mobile */}
        <button
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-atfr-bone"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          aria-controls="academy-mobile-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="academy-mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:hidden overflow-hidden border-t border-atfr-gold/10 bg-atfr-carbon/98"
          >
            <nav aria-label="Navigation académie mobile" className="container py-4 flex flex-col gap-1">
              {moduleLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                      isActive
                        ? 'text-atfr-gold bg-atfr-gold/10'
                        : 'text-atfr-fog hover:text-atfr-bone',
                    )
                  }
                >
                  <Icon size={14} strokeWidth={1.8} />
                  {label}
                </NavLink>
              ))}
              <div className="border-t border-atfr-gold/10 pt-3 mt-2">
                <WgProfileBubble />
              </div>
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-atfr-fog/50 hover:text-atfr-fog transition-colors"
              >
                <ArrowLeft size={12} />
                Retour au site du clan
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
