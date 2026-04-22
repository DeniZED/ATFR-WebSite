import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Shield, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { Button } from '@/components/ui/Button';

const links = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/membres', label: 'Membres' },
  { to: '/evenements', label: 'Événements' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/recrutement', label: 'Recrutement' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
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

        <nav className="hidden lg:flex items-center gap-1">
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
          <Link to="/admin">
            <Button variant="ghost" size="sm" leadingIcon={<Shield size={16} />}>
              Admin
            </Button>
          </Link>
          <Link to="/recrutement">
            <Button size="sm">Postuler</Button>
          </Link>
        </div>

        <button
          className="lg:hidden h-10 w-10 inline-flex items-center justify-center text-atfr-bone"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          'lg:hidden overflow-hidden border-t border-atfr-gold/10 bg-atfr-ink/95 backdrop-blur-lg',
          'transition-[max-height] duration-300 ease-emphasized',
          open ? 'max-h-96' : 'max-h-0',
        )}
      >
        <nav className="container py-4 flex flex-col gap-1">
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
          <Link to="/admin" className="px-3 py-2 text-sm text-atfr-fog/80">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
