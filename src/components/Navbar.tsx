import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: "#", label: "Accueil" },
  { href: "#about", label: "À Propos" },
  { href: "#achievements", label: "Exploits" },
  { href: "#activities", label: "Notre Activité" },
  { href: "#join", label: "Nous Rejoindre" }
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full z-50 bg-wot-darker/95 backdrop-blur-sm border-b border-wot-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
              alt="ATFR Logo" 
              className="h-10 w-10"
            />
          </div>

          {/* Navigation Desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-6">
              {navLinks.map((link) => (
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
              ))}
            </div>
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden flex flex-1 justify-end">
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

      {/* Menu Mobile Déroulant */}
      {isOpen && (
        <div className="md:hidden bg-wot-darker border-t border-wot-gold/10">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
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
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}