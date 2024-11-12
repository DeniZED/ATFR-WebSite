import React from 'react';
import { Github, MessageCircle, Youtube } from 'lucide-react';

const socialLinks = [
  { icon: MessageCircle, href: "https://discord.gg/wxhUYVaKYr", label: "Discord" },
  { icon: Youtube, href: "https://www.youtube.com/@ATFR/featured", label: "YouTube" },
  { icon: Github, href: "#", label: "GitHub" }
];

export default function Footer() {
  return (
    <footer className="bg-wot-darker py-12 px-4 border-t border-wot-gold/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <img 
            src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
            alt="ATFR Logo"
            className="h-12 w-12 mb-4"
          />
          <h3 className="text-2xl font-bold mb-2 text-wot-gold">- ATFR -</h3>
          <p className="text-wot-light/80">Des valeurs partagées depuis 2020</p>
        </div>
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-wot-light hover:text-wot-gold transition-colors"
              aria-label={link.label}
            >
              <link.icon className="h-6 w-6" strokeWidth={1.5} />
            </a>
          ))}
        </div>
        <div className="text-center text-wot-light/60 text-sm">
          <p>© {new Date().getFullYear()} ATFR. Tous droits réservés.</p>
          <p className="mt-2">
            World of Tanks est une marque déposée de Wargaming.net
          </p>
        </div>
      </div>
    </footer>
  );
}