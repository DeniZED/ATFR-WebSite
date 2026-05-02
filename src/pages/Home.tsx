import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { WhyJoin } from '@/components/sections/WhyJoin';
import { About } from '@/components/sections/About';
import { Activities } from '@/components/sections/Activities';
import { AcademyPreview } from '@/components/sections/AcademyPreview';
import { Highlights } from '@/components/sections/Highlights';
import { Achievements } from '@/components/sections/Achievements';
import { Testimonials } from '@/components/sections/Testimonials';
import { DiscordCommunity } from '@/components/sections/DiscordCommunity';
import { JoinCta } from '@/components/sections/JoinCta';

export default function Home() {
  return (
    <>
      <Hero />
      <LiveStats />
      <WhyJoin />
      <About />
      <Activities />
      <AcademyPreview />
      <Highlights />
      <Achievements />
      <Testimonials />
      <DiscordCommunity />
      <JoinCta />
    </>
  );
}
