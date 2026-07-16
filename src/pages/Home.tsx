import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { WhyJoin } from '@/components/sections/WhyJoin';
import { Activities } from '@/components/sections/Activities';
import { DiscordCommunity } from '@/components/sections/DiscordCommunity';
import { AcademyPreview } from '@/components/sections/AcademyPreview';
import { About } from '@/components/sections/About';
import { ClanHistory } from '@/components/sections/ClanHistory';
import { Highlights } from '@/components/sections/Highlights';
import { RecruitProfileSection } from '@/components/sections/RecruitProfileSection';
import { JoinProcessSection } from '@/components/sections/JoinProcessSection';
import { Testimonials } from '@/components/sections/Testimonials';
import { JoinCta } from '@/components/sections/JoinCta';
import { PageMeta } from '@/components/seo/PageMeta';

/**
 * Parcours vitrine, ordonné pour raconter une histoire :
 * découvrir ATFR → prouver que le clan est actif (stats) → comprendre
 * l'intérêt → voir les activités → la communauté → les outils → l'identité
 * et l'histoire → le profil recherché → comment postuler → CTA final.
 *
 * NB : « Moments forts » et « Témoignages » sont réintégrés mais se cachent
 * d'eux-mêmes tant qu'aucun contenu n'est publié (return null) — ils
 * apparaîtront automatiquement dès qu'on ajoutera une entrée en admin.
 * « Prochaine opération » reste hors flux (composant conservé).
 */
export default function Home() {
  return (
    <>
      <PageMeta
        title="Clan World of Tanks francophone"
        description="ATFR — clan World of Tanks francophone : Clan Wars, académie, entraide et bonne ambiance. Rejoins-nous !"
      />
      <div className="home-flow">
        <Hero />
        <LiveStats />
        <WhyJoin />
        <Activities />
        <DiscordCommunity />
        <AcademyPreview />
        <About />
        <ClanHistory />
        <Highlights />
        <RecruitProfileSection />
        <JoinProcessSection />
        <Testimonials />
        <JoinCta />
      </div>
    </>
  );
}
