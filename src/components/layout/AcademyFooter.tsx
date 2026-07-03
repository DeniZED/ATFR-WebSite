import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, Map } from 'lucide-react';
import { env } from '@/lib/env';

export function AcademyFooter() {
  return (
    <footer className="border-t border-atfr-gold/10 bg-atfr-carbon/80 mt-16">
      <div className="container py-10 grid gap-8 sm:grid-cols-3">
        {/* Identité */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-atfr-gold" strokeWidth={1.8} />
            <p className="font-display text-lg text-atfr-bone tracking-wide">
              ATFR Academy
            </p>
          </div>
          <p className="text-sm text-atfr-fog leading-relaxed">
            Plateforme communautaire autour de World of Tanks. Ouverte à tous les joueurs, membres ATFR ou non.
          </p>
        </div>

        {/* Modules */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Modules
          </p>
          <ul className="space-y-2 text-sm text-atfr-fog">
            <li>
              <Link to="/modules" className="flex items-center gap-2 hover:text-atfr-gold transition-colors">
                <GraduationCap size={13} strokeWidth={1.8} />
                Hub académie
              </Link>
            </li>
            <li>
              <Link to="/modules/guide-bots" className="flex items-center gap-2 hover:text-atfr-gold transition-colors">
                <BookOpen size={13} strokeWidth={1.8} />
                Guide pour les bots
              </Link>
            </li>
            <li>
              <Link to="/modules/wot-geoguesser" className="flex items-center gap-2 hover:text-atfr-gold transition-colors">
                <Map size={13} strokeWidth={1.8} />
                WoT GeoGuesseur
              </Link>
            </li>
          </ul>
        </div>

        {/* Clan */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Le clan
          </p>
          <ul className="space-y-2 text-sm text-atfr-fog">
            <li>
              <Link to="/" className="hover:text-atfr-gold transition-colors">
                Site {env.clanTag}
              </Link>
            </li>
            <li>
              <Link to="/recrutement" className="hover:text-atfr-gold transition-colors">
                Nous rejoindre
              </Link>
            </li>
            <li>
              <a
                href="https://worldoftanks.eu/fr/clans/500191501-ATFR/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-atfr-gold transition-colors"
              >
                Page Wargaming
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-atfr-gold/10">
        <div className="container py-4 text-xs text-atfr-fog/85 flex items-center justify-between">
          <p>© {new Date().getFullYear()} ATFR Academy — Initiative du clan {env.clanTag}. Non affilié à Wargaming.net.</p>
        </div>
      </div>
    </footer>
  );
}
