import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  FileText,
  Gauge,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  LogOut,
  Map,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Type,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { ROLE_LABELS } from '@/types/database';

type Area = 'applications' | 'events' | 'members' | 'content' | 'media' | 'users';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Gauge;
  end?: boolean;
  area?: Area;
}

const nav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/candidatures', label: 'Candidatures', icon: FileText, area: 'applications' },
  { to: '/admin/membres', label: 'Membres', icon: Users, area: 'members' },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar, area: 'events' },
  { to: '/admin/contenu', label: 'Contenu', icon: Type, area: 'content' },
  { to: '/admin/galerie', label: 'Galerie', icon: ImageIcon, area: 'media' },
  { to: '/admin/moments', label: 'Moments forts', icon: Star, area: 'content' },
  { to: '/admin/palmares', label: 'Palmarès', icon: Trophy, area: 'content' },
  { to: '/admin/temoignages', label: 'Témoignages', icon: Sparkles, area: 'content' },
  { to: '/admin/modules', label: 'Académie', icon: GraduationCap, area: 'content' },
  { to: '/admin/quiz', label: 'Guide pour les bots', icon: BookOpen, area: 'content' },
  { to: '/admin/geoguesser', label: 'GeoGuesser', icon: Map, area: 'content' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: KeyRound, area: 'users' },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { role, can } = useRole();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  const visibleNav = nav.filter((item) => !item.area || can(item.area));

  return (
    <div className="min-h-screen bg-atfr-ink">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-atfr-carbon border-r border-atfr-gold/10',
          'transition-transform duration-300 ease-emphasized lg:translate-x-0',
          'flex flex-col',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 shrink-0 flex items-center gap-3 px-6 border-b border-atfr-gold/10">
          <Shield className="text-atfr-gold" size={22} />
          <div>
            <p className="font-display text-lg text-atfr-bone leading-none">
              {env.clanTag}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-atfr-gold/80">
              Admin
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-atfr-gold/10 text-atfr-gold'
                    : 'text-atfr-fog hover:bg-atfr-graphite hover:text-atfr-bone',
                )
              }
              onClick={() => setOpen(false)}
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-4 border-t border-atfr-gold/10">
          <p className="text-xs text-atfr-fog/80 truncate">{user?.email}</p>
          {role && (
            <p className="text-[10px] uppercase tracking-[0.25em] text-atfr-gold/80 mb-2">
              {ROLE_LABELS[role]}
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leadingIcon={<LogOut size={14} />}
            className="w-full justify-start"
          >
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="lg:hidden sticky top-0 z-30 bg-atfr-ink/90 backdrop-blur border-b border-atfr-gold/10 h-14 flex items-center justify-between px-4">
          <Link to="/admin" className="font-display text-atfr-bone">
            {env.clanTag} Admin
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="h-10 w-10 inline-flex items-center justify-center"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
