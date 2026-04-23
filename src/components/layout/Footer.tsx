import { Link } from 'react-router-dom';
import { env } from '@/lib/env';

export function Footer() {
  return (
    <footer className="border-t border-atfr-gold/10 bg-atfr-ink/60 mt-20">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl text-atfr-bone tracking-widest">
            {env.clanTag}
          </p>
          <p className="mt-2 text-sm text-atfr-fog leading-relaxed">
            Clan francophone World of Tanks. Communauté, esprit d'équipe,
            progression.
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Navigation
          </p>
          <ul className="space-y-2 text-sm text-atfr-fog">
            <li><Link to="/" className="hover:text-atfr-gold">Accueil</Link></li>
            <li><Link to="/membres" className="hover:text-atfr-gold">Membres</Link></li>
            <li><Link to="/evenements" className="hover:text-atfr-gold">Événements</Link></li>
            <li><Link to="/galerie" className="hover:text-atfr-gold">Galerie</Link></li>
            <li><Link to="/recrutement" className="hover:text-atfr-gold">Rejoindre</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Liens utiles
          </p>
          <ul className="space-y-2 text-sm text-atfr-fog">
            <li>
              <a
                href="https://worldoftanks.eu/fr/clans/500191501-ATFR/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-atfr-gold"
              >
                Page Wargaming
              </a>
            </li>
            <li>
              <a
                href="https://tomato.gg/clan/eu/500191501/ATFR"
                target="_blank"
                rel="noreferrer"
                className="hover:text-atfr-gold"
              >
                Stats tomato.gg
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold/80 mb-3">
            Contact
          </p>
          <p className="text-sm text-atfr-fog leading-relaxed">
            Passez par notre formulaire de recrutement ou contactez nos
            officiers en jeu.
          </p>
        </div>
      </div>

      <div className="border-t border-atfr-gold/10">
        <div className="container py-4 text-xs text-atfr-fog/80 flex items-center justify-between">
          <p>© {new Date().getFullYear()} {env.clanTag}. Fan site non affilié à Wargaming.net.</p>
          <Link to="/admin" className="hover:text-atfr-gold">
            Administration
          </Link>
        </div>
      </div>
    </footer>
  );
}
