import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Command, LogOut, Menu, Shield, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { env } from '@/lib/env';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/Button';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';
import { CommandPalette } from '@/components/admin/CommandPalette';
import { navGroups, topNav, type NavGroup, type NavItem } from './adminNav';
import { ROLE_LABELS } from '@/types/database';

const NAV_COLLAPSED_KEY = 'atfr.admin.nav.collapsed.v1';

function readCollapsedGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(NAV_COLLAPSED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    /* ignore */
  }
  return new Set();
}

/** Le groupe contenant la route courante ne peut pas être replié. */
function groupContainsPath(group: NavGroup, pathname: string): boolean {
  return group.items.some(
    (item) => pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => readCollapsedGroups());
  const { signOut, user } = useAuth();
  const { role, canAccess } = useRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Raccourci global ⌘K / Ctrl+K pour ouvrir la palette de commandes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function handleLogout() {
    await signOut();
    navigate('/admin/login');
  }

  function toggleGroup(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(NAV_COLLAPSED_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  const canSee = (item: NavItem) => !item.moduleKey || canAccess(item.moduleKey);
  const visibleTopNav = topNav.filter(canSee);
  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0);

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

        <div className="px-3 pt-4">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="w-full flex items-center gap-2 rounded-md border border-atfr-gold/15 bg-atfr-ink/40 px-3 py-2 text-sm text-atfr-fog hover:border-atfr-gold/30 hover:text-atfr-bone transition-colors"
          >
            <Command size={14} className="shrink-0" />
            <span className="flex-1 text-left">Rechercher…</span>
            <kbd className="text-[10px] font-mono tracking-wider text-atfr-fog/70 border border-atfr-gold/20 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav aria-label="Navigation administration" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleTopNav.map((item) => (
            <AdminNavLink key={item.to} item={item} onNavigate={() => setOpen(false)} />
          ))}

          {visibleGroups.map((group) => {
            const hasActive = groupContainsPath(group, pathname);
            const isOpen = hasActive || !collapsed.has(group.id);
            return (
              <div key={group.id} className="pt-3 first:pt-0">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={isOpen}
                  aria-controls={`admin-nav-group-${group.id}`}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] uppercase tracking-[0.2em] text-atfr-fog/85 hover:text-atfr-bone transition-colors"
                >
                  {group.label}
                  <ChevronDown
                    size={13}
                    className={cn(
                      'shrink-0 transition-transform duration-200',
                      isOpen ? '' : '-rotate-90',
                    )}
                  />
                </button>
                {isOpen && (
                  <div id={`admin-nav-group-${group.id}`} className="space-y-1 mt-0.5">
                    {group.items.map((item) => (
                      <AdminNavLink
                        key={item.to}
                        item={item}
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Rechercher une page"
              className="h-10 w-10 inline-flex items-center justify-center text-atfr-fog"
            >
              <Command size={18} />
            </button>
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
        </div>

        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        canAccess={canAccess}
      />
    </div>
    </ConfirmProvider>
  );
}

function AdminNavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  return (
    <NavLink
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
      onClick={onNavigate}
    >
      <item.icon size={18} strokeWidth={1.5} />
      {item.label}
    </NavLink>
  );
}
