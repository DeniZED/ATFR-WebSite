import { Link } from 'react-router-dom';
import { env } from '@/lib/env';
import { useNavVisibility } from '@/features/content/useNavVisibility';

const navLinks = [
  { to: '/', label: 'Accueil', always: true },
  { to: '/membres', label: 'Membres', key: 'members' as const },
  { to: '/evenements', label: 'Événements', key: 'events' as const },
  { to: '/galerie', label: 'Galerie', key: 'gallery' as const },
  { to: '/modules', label: 'Académie', always: true },
  { to: '/recrutement', label: 'Rejoindre', always: true },
];

export function Footer() {
  const { data: vis } = useNavVisibility();

  // Même règle que la navbar : on masque un lien si sa page est vide /
  // désactivée. Tant que la visibilité charge (`vis` indéfini), on affiche tout.
  const links = navLinks.filter((l) => {
    if (l.always || !vis) return true;
    if (l.key === 'members') return vis.members;
    if (l.key === 'events') return vis.events;
    if (l.key === 'gallery') return vis.gallery;
    return true;
  });

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
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="hover:text-atfr-gold transition-colors duration-200"
                >
                  {l.label}
                </Link>
              </li>
            ))}
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
                className="hover:text-atfr-gold transition-colors duration-200"
              >
                Page Wargaming
              </a>
            </li>
            <li>
              <a
                href="https://tomato.gg/clan/eu/500191501/ATFR"
                target="_blank"
                rel="noreferrer"
                className="hover:text-atfr-gold transition-colors duration-200"
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
        <div className="container py-4 text-xs text-atfr-fog/85">
          <p>© {new Date().getFullYear()} {env.clanTag}. Fan site non affilié à Wargaming.net.</p>
        </div>
      </div>
    </footer>
  );
}
