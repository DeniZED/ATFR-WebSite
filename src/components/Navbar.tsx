import React, { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#about", label: "À Propos" },
  { href: "/#achievements", label: "Exploits" },
  { href: "/#activities", label: "Notre Activité" },
  { href: "/#join", label: "Nous Rejoindre" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const handleClick = () => {
    setIsOpen(false);
  };

  const isHomePage = location.pathname === '/';

  return (
    <nav className="fixed w-full z-50 bg-wot-darker/95 backdrop-blur-sm border-b border-wot-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
                alt="ATFR Logo" 
                className="h-10 w-10"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                {isHomePage ? (
                  navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-wot-light hover:text-wot-gold px-3 py-2 text-sm 
                               uppercase tracking-wider font-medium
                               border-b-2 border-transparent hover:border-wot-gold/50 
                               transition-all duration-300"
                      onClick={handleClick}
                    >
                      {link.label}
                    </a>
                  ))
                ) : (
                  <Link
                    to="/"
                    className="text-wot-light hover:text-wot-gold px-3 py-2 text-sm 
                             uppercase tracking-wider font-medium
                             border-b-2 border-transparent hover:border-wot-gold/50 
                             transition-all duration-300"
                  >
                    Retour au site
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-sm uppercase tracking-wider font-medium
                         border-2 border-wot-gold/30 hover:border-wot-gold/50 
                         transition-all duration-300 rounded-lg"
              >
                <Shield className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-sm uppercase tracking-wider font-medium
                         border-2 border-wot-gold/30 hover:border-wot-gold/50 
                         transition-all duration-300 rounded-lg"
              >
                <Shield className="h-4 w-4 mr-2" strokeWidth={1.5} />
                Admin
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 text-wot-light 
                       hover:text-wot-gold hover:bg-wot-gray/50 
                       transition-colors duration-300 focus:outline-none"
            >
              {isOpen ? 
                <X className="h-6 w-6" strokeWidth={1.5} /> : 
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              }
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-wot-darker border-t border-wot-gold/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isHomePage ? (
              navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-wot-light hover:text-wot-gold block px-3 py-2 
                           text-base uppercase tracking-wider font-medium
                           hover:bg-wot-gray/50 transition-all duration-300"
                  onClick={handleClick}
                >
                  {link.label}
                </a>
              ))
            ) : (
              <Link
                to="/"
                className="text-wot-light hover:text-wot-gold block px-3 py-2 
                         text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300"
                onClick={handleClick}
              >
                Retour au site
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300"
                onClick={handleClick}
              >
                <Shield className="h-5 w-5 mr-2" strokeWidth={1.5} />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center text-wot-light hover:text-wot-gold 
                         px-3 py-2 text-base uppercase tracking-wider font-medium
                         hover:bg-wot-gray/50 transition-all duration-300"
                onClick={handleClick}
              >
                <Shield className="h-5 w-5 mr-2" strokeWidth={1.5} />
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}