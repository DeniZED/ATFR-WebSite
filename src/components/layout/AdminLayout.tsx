import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/admin/candidatures', label: 'Candidatures', icon: FileText },
  { to: '/admin/membres', label: 'Membres', icon: Users },
  { to: '/admin/evenements', label: 'Événements', icon: Calendar },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen bg-atfr-ink">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-atfr-carbon border-r border-atfr-gold/10',
          'transition-transform duration-300 ease-emphasized lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-atfr-gold/10">
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

        <nav className="px-3 py-4 space-y-1">
          {nav.map((item) => (
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

        <div className="absolute inset-x-0 bottom-0 p-4 border-t border-atfr-gold/10">
          <p className="text-xs text-atfr-fog/80 mb-2 truncate">{user?.email}</p>
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
