import { Calendar, Target, Users, BookOpen } from 'lucide-react';
import { TANKS } from '@/data/clan-hub/tanks';
import { PriorityBadge } from '@/components/clan-hub/PriorityBadge';
import { Link } from 'react-router-dom';

const CW_TANKS = TANKS.filter((t) => t.modes.includes('cw') && t.clan_priority === 'prioritaire');

export default function ClanHubCW() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-atfr-gold/60 mb-1">Clan Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl text-atfr-bone">Clan Wars</h1>
        <p className="mt-1 text-sm text-atfr-fog">Prépare-toi pour les sessions CW.</p>
      </div>

      {/* Prochaine session */}
      <div className="rounded-xl border border-atfr-gold/20 bg-atfr-gold/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-atfr-gold" />
          <h2 className="font-display text-lg text-atfr-bone">Prochaine session</h2>
        </div>
        <p className="text-sm text-atfr-fog">
          Les sessions CW sont annoncées sur Discord. Surveille le canal <span className="font-mono text-atfr-bone">#cw-annonces</span> pour les dates et les compos demandées.
        </p>
      </div>

      {/* Chars CW */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target size={15} className="text-atfr-gold/70" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-atfr-fog/50">Chars CW prioritaires</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {CW_TANKS.map((t) => (
            <div key={t.slug} className="flex items-center gap-3 rounded-lg border border-atfr-gold/10 bg-atfr-graphite/20 px-3 py-2.5">
              <span className="text-xs font-mono text-atfr-fog/50">{t.class}</span>
              <span className="flex-1 text-sm text-atfr-bone">{t.name}</span>
              <PriorityBadge priority={t.clan_priority} />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-atfr-fog/50">
          Voir les fiches complètes dans <Link to="/clan-hub/chars" className="text-atfr-gold/60 hover:text-atfr-gold underline underline-offset-2">Fiches chars</Link>.
        </p>
      </div>

      {/* Checklist préparation */}
      <div className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-atfr-gold/70" />
          <h2 className="font-display text-lg text-atfr-bone">Checklist avant une session</h2>
        </div>
        <ul className="space-y-2.5">
          {[
            'Char équipé selon la fiche chars (équipements + consommables)',
            'Équipage à jour — au minimum Frères d\'armes',
            'Vocal testé et fonctionnel',
            'Disponible pour toute la session — prévenir si départ anticipé',
            'Revu les strats des cartes jouées récemment',
            'Munitions complètes — pas de farm entre les games',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-atfr-fog">
              <span className="shrink-0 mt-0.5 h-4 w-4 rounded border border-atfr-gold/25 bg-atfr-graphite/60 flex items-center justify-center text-[10px] text-atfr-gold/60">{i + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Liens utiles */}
      <div className="rounded-xl border border-atfr-gold/10 bg-atfr-graphite/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={15} className="text-atfr-gold/70" />
          <h2 className="font-display text-lg text-atfr-bone">Ressources CW</h2>
        </div>
        <div className="space-y-2">
          <Link to="/clan-hub/strategies" className="block text-sm text-atfr-fog hover:text-atfr-bone">→ Tactiques clan</Link>
          <Link to="/clan-hub/maps" className="block text-sm text-atfr-fog hover:text-atfr-bone">→ Fiches cartes</Link>
          <Link to="/clan-hub/doctrine" className="block text-sm text-atfr-fog hover:text-atfr-bone">→ Doctrine ATFR</Link>
          <Link to="/clan-hub/liens" className="block text-sm text-atfr-fog hover:text-atfr-bone">→ Ressources externes (Carte globale, stats…)</Link>
        </div>
      </div>
    </div>
  );
}
