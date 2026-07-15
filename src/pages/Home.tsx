import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { WhyJoin } from '@/components/sections/WhyJoin';
import { NextOperation } from '@/components/sections/NextOperation';
import { About } from '@/components/sections/About';
import { ClanHistory } from '@/components/sections/ClanHistory';
import { Activities } from '@/components/sections/Activities';
import { AcademyPreview } from '@/components/sections/AcademyPreview';
import { Highlights } from '@/components/sections/Highlights';
import { Testimonials } from '@/components/sections/Testimonials';
import { DiscordCommunity } from '@/components/sections/DiscordCommunity';
import { JoinCta } from '@/components/sections/JoinCta';
import { PageMeta } from '@/components/seo/PageMeta';

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
        <NextOperation />
        <About />
        <ClanHistory />
        <Activities />
        <AcademyPreview />
        <Highlights />
        <Testimonials />
        <DiscordCommunity />
        <JoinCta />
      </div>
    </>
  );
}
