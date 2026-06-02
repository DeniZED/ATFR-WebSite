import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, GraduationCap, Menu, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { usePublishedModules } from '@/features/modules/queries';
import { WgProfileBubble } from './WgProfileBubble';

export function AcademyNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: modules } = usePublishedModules();

  useEffect(() => {
    setMobileOpen(false);
    setModulesOpen(false);
  }, [location.pathname]);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModulesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isModulePage = location.pathname.startsWith('/modules/');

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-atfr-carbon/95 backdrop-blur-lg border-b border-atfr-gold/15">
      {/* Ligne d'accent dorée */}
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

        {/* Navigation desktop */}
        <nav aria-label="Modules" className="hidden lg:flex items-center gap-1">
          {/* Hub */}
          <NavLink
            to="/modules"
            end
            className={({ isActive }) =>
              cn(
                'px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-md',
                isActive ? 'text-atfr-gold bg-atfr-gold/10' : 'text-atfr-fog hover:text-atfr-bone',
              )
            }
          >
            Hub
          </NavLink>

          {/* Dropdown modules */}
          {modules && modules.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setModulesOpen((o) => !o)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-md',
                  isModulePage ? 'text-atfr-gold' : 'text-atfr-fog hover:text-atfr-bone',
                )}
              >
                Modules
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', modulesOpen && 'rotate-180')}
                />
              </button>

              <AnimatePresence>
                {modulesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                    className="absolute left-0 top-full mt-2 w-64 rounded-xl border border-atfr-gold/20 bg-atfr-carbon shadow-xl overflow-hidden"
                  >
                    {modules.map(({ registry, row }) => {
                      const Icon = registry.icon;
                      const title = row.custom_title || registry.title;
                      return (
                        <NavLink
                          key={registry.slug}
                          to={`/modules/${registry.path}`}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-atfr-gold/5 last:border-0',
                              isActive
                                ? 'bg-atfr-gold/10 text-atfr-gold'
                                : 'text-atfr-fog hover:bg-atfr-graphite hover:text-atfr-bone',
                            )
                          }
                        >
                          <Icon size={15} strokeWidth={1.8} className="shrink-0 text-atfr-gold/70" />
                          <span className="truncate">{title}</span>
                          {registry.membersOnly && (
                            <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-500/80 shrink-0">
                              Membres
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* Droite : profil WG */}
        <div className="hidden lg:flex items-center gap-2">
          <WgProfileBubble />
        </div>

        {/* Burger mobile */}
        <button
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-atfr-bone"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="academy-mobile-nav"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="academy-mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:hidden overflow-hidden border-t border-atfr-gold/10 bg-atfr-carbon/98"
          >
            <nav aria-label="Navigation académie mobile" className="container py-4 flex flex-col gap-1">
              <NavLink
                to="/modules"
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                    isActive ? 'text-atfr-gold bg-atfr-gold/10' : 'text-atfr-fog hover:text-atfr-bone',
                  )
                }
              >
                <GraduationCap size={14} strokeWidth={1.8} />
                Hub académie
              </NavLink>

              {modules?.map(({ registry, row }) => {
                const Icon = registry.icon;
                const title = row.custom_title || registry.title;
                return (
                  <NavLink
                    key={registry.slug}
                    to={`/modules/${registry.path}`}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm',
                        isActive ? 'text-atfr-gold bg-atfr-gold/10' : 'text-atfr-fog hover:text-atfr-bone',
                      )
                    }
                  >
                    <Icon size={14} strokeWidth={1.8} />
                    <span className="flex-1 truncate">{title}</span>
                    {registry.membersOnly && (
                      <span className="text-[9px] uppercase tracking-wider text-amber-500/80">
                        Membres
                      </span>
                    )}
                  </NavLink>
                );
              })}

              <div className="border-t border-atfr-gold/10 pt-3 mt-2 flex items-center justify-between px-3">
                <WgProfileBubble />
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-sm text-atfr-fog/50 hover:text-atfr-fog transition-colors"
                >
                  <ArrowLeft size={12} />
                  Retour au clan
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
