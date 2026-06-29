import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Crosshair, Users, Swords, Map, BookOpen, Flag, Link } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/clan',             label: 'Accueil',       icon: LayoutDashboard, end: true },
  { to: '/clan/chars',       label: 'Fiches chars',  icon: Crosshair },
  { to: '/clan/roles',       label: 'Rôles',         icon: Users },
  { to: '/clan/strategies',  label: 'Tactiques',     icon: Swords },
  { to: '/clan/maps',        label: 'Cartes',        icon: Map },
  { to: '/clan/doctrine',    label: 'Doctrine',      icon: BookOpen },
  { to: '/clan/evenements',          label: 'Clan Wars',     icon: Flag },
  { to: '/clan/liens',       label: 'Ressources',    icon: Link },
];

function NavItem({ to, label, icon: Icon, end }: (typeof NAV)[0]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-atfr-gold/10 text-atfr-gold border border-atfr-gold/25'
            : 'text-atfr-fog hover:text-atfr-bone hover:bg-atfr-graphite/40 border border-transparent',
        )
      }
    >
      <Icon size={16} strokeWidth={1.6} />
      {label}
    </NavLink>
  );
}

export function ClanLayout() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-atfr-gold/10 bg-atfr-ink/60 py-6 px-3 gap-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-atfr-fog/40">
          Centre tactique
        </p>
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </aside>

      {/* Mobile tabs */}
      <nav className="lg:hidden flex overflow-x-auto border-b border-atfr-gold/10 bg-atfr-ink/80 px-2 gap-1 py-1.5 scrollbar-hide">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-atfr-gold/10 text-atfr-gold'
                  : 'text-atfr-fog hover:text-atfr-bone',
              )
            }
          >
            <Icon size={14} strokeWidth={1.6} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
