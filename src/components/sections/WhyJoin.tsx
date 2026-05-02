import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Crosshair,
  Headphones,
  LineChart,
  ShieldCheck,
} from 'lucide-react';
import { Button, Section } from '@/components/ui';

const pillars = [
  {
    icon: Headphones,
    title: 'Ambiance vocale',
    text: 'Un Discord vivant pour lancer des pelotons, organiser les soirées et garder le contact hors bataille.',
    stat: 'Discord actif',
  },
  {
    icon: Crosshair,
    title: 'Progression utile',
    text: "Des retours concrets, des modules d'académie et des outils pour travailler décision, map awareness et placement.",
    stat: 'Coaching clan',
  },
  {
    icon: ShieldCheck,
    title: 'Jeu structuré',
    text: 'Escarmouches, événements et objectifs communs avec une organisation claire sans perdre le plaisir de jouer.',
    stat: 'Objectifs partagés',
  },
  {
    icon: LineChart,
    title: 'Culture performance',
    text: "Des stats suivies, des replays discutés et une envie simple : progresser ensemble sans casser l'ambiance.",
    stat: 'Stats lisibles',
  },
];

export function WhyJoin() {
  return (
    <Section
      eyebrow="Pourquoi ATFR"
      title="Un clan qui aide vraiment à jouer mieux"
      description="La home doit montrer en quelques secondes que le clan est actif, organisé et utile aux joueurs qui veulent progresser."
      className="overflow-hidden"
    >
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{
                duration: 0.45,
                delay: i * 0.07,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              whileHover={{ y: -5 }}
              className="group relative overflow-hidden rounded-xl border border-atfr-gold/15 bg-atfr-carbon p-6"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-atfr-gold/0 via-atfr-gold/70 to-atfr-gold/0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 text-atfr-gold">
                <pillar.icon size={21} strokeWidth={1.6} />
              </div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-atfr-gold/80">
                {pillar.stat}
              </p>
              <h3 className="font-display text-2xl text-atfr-bone">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-atfr-fog">
                {pillar.text}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-70px' }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative overflow-hidden rounded-xl border border-atfr-gold/20 bg-atfr-graphite/70 p-7"
        >
          <div
            className="absolute inset-0 bg-grid bg-[size:38px_38px] opacity-25"
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.3em] text-atfr-gold">
              Parcours joueur
            </p>
            <h3 className="mt-3 font-display text-3xl text-atfr-bone">
              De la candidature au vocal, le chemin est plus clair.
            </h3>
            <div className="mt-8 space-y-5">
              {[
                'Postuler avec les infos utiles',
                'Passer en vocal et jouer quelques games',
                'Trouver sa place dans les activités du clan',
              ].map((step, i) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-atfr-gold/40 bg-atfr-ink text-sm font-semibold text-atfr-gold">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-atfr-bone">{step}</p>
                    <p className="mt-1 text-sm text-atfr-fog">
                      {i === 0
                        ? 'Le formulaire donne une base propre aux officiers.'
                        : i === 1
                          ? 'La vraie compatibilité se voit vite en jeu.'
                          : 'Le site devient le hub qui garde tout lisible.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/recrutement" className="mt-8 inline-flex">
              <Button trailingIcon={<ArrowRight size={14} />}>Postuler</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
