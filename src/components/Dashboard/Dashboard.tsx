import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  BarChart3,
  Users,
  History,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

import Statistics from './Statistics';
import Members from './Members';
import MembersHistory from './MembersHistory';
import Applications from './Applications';
import Events from './Events';
import SettingsPage from './Settings';

const navigation = [
  { name: 'Dashboard', href: '/dashboard/statistics', icon: BarChart3 },
  { name: 'Membres', href: '/dashboard/members', icon: Users },
  { name: 'Historique', href: '/dashboard/history', icon: History },
  { name: 'Candidatures', href: '/dashboard/applications', icon: FileText },
  { name: 'Événements', href: '/dashboard/events', icon: Calendar },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-wot-dark">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <button
          className="fixed top-4 left-4 p-2 text-wot-light z-50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" strokeWidth={1.5} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-wot-darker transform 
                   transition-transform duration-300 ease-in-out lg:translate-x-0
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center h-16 px-4 bg-wot-dark border-b border-wot-gold/20">
            <img
              src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
              alt="ATFR Logo"
              className="h-10 w-10"
            />
            <span className="ml-2 text-xl font-bold text-wot-gold">ATFR Admin</span>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 text-wot-light hover:bg-wot-dark
                         hover:text-wot-gold rounded-lg transition-colors duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" strokeWidth={1.5} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-wot-gold/20">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-wot-light
                     hover:text-wot-gold rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-3" strokeWidth={1.5} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="p-6">
          <Routes>
            <Route path="statistics" element={<Statistics />} />
            <Route path="members" element={<Members />} />
            <Route path="history" element={<MembersHistory />} />
            <Route path="applications" element={<Applications />} />
            <Route path="events" element={<Events />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}