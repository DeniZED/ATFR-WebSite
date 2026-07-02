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
  Lock,
  LogOut,
  Map,
  Menu,
  Settings,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Type,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';
import { ROLE_LABELS } from '@/types/database';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Gauge;
  end?: boolean;
  moduleKey?: string;
}

const nav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/candidatures', label: 'Candidatures', icon: FileText, moduleKey: 'candidatures' },
  { to: '/admin/membres', label: 'Membres', icon: Users, moduleKey: 'membres' },
  { to: '/admin/rh', label: 'RH joueurs', icon: UserCog, moduleKey: 'rh' },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar, moduleKey: 'evenements' },
  { to: '/admin/clan-wars', label: 'Clan Wars', icon: Swords, moduleKey: 'clan-wars' },
  { to: '/admin/contenu', label: 'Contenu', icon: Type, moduleKey: 'contenu' },
  { to: '/admin/galerie', label: 'Galerie', icon: ImageIcon, moduleKey: 'galerie' },
  { to: '/admin/moments', label: 'Moments forts', icon: Star, moduleKey: 'moments' },
  { to: '/admin/palmares', label: 'Palmarès', icon: Trophy, moduleKey: 'palmares' },
  { to: '/admin/temoignages', label: 'Témoignages', icon: Sparkles, moduleKey: 'temoignages' },
  { to: '/admin/modules', label: 'Académie', icon: GraduationCap, moduleKey: 'modules' },
  { to: '/admin/academie', label: 'Joueurs Académie', icon: GraduationCap, moduleKey: 'academie' },
  { to: '/admin/quiz', label: 'Guide pour les bots', icon: BookOpen, moduleKey: 'quiz' },
  { to: '/admin/geoguesser', label: 'GeoGuesser', icon: Map, moduleKey: 'geoguesser' },
  { to: '/admin/pages-clan', label: 'Pages clan', icon: Lock, moduleKey: 'pages-clan' },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: KeyRound, moduleKey: 'utilisateurs' },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings, moduleKey: 'parametres' },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { role, canAccess } = useRole();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  const visibleNav = nav.filter((item) => !item.moduleKey || canAccess(item.moduleKey));

  return (
    <ConfirmProvider>
    <div className="min-h-screen bg-atfr-ink">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-atfr-ink/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-sidebar"
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

        <nav aria-label="Navigation administration" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            aria-controls="admin-sidebar"
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
    </ConfirmProvider>
  );
}
