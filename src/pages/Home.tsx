import { Hero } from '@/components/sections/Hero';
import { PrestigeBanner } from '@/components/sections/PrestigeBanner';
import { LiveStats } from '@/components/sections/LiveStats';
import { WhyJoin } from '@/components/sections/WhyJoin';
import { NextOperation } from '@/components/sections/NextOperation';
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
      <PrestigeBanner />
      <LiveStats />        {/* tinted HUD */}
      <WhyJoin />          {/* transparent */}
      <NextOperation />    {/* tinted */}
      <About />            {/* tinted */}
      <Activities />       {/* transparent */}
      <AcademyPreview />   {/* tinted */}
      <Highlights />       {/* tinted */}
      <Achievements />     {/* transparent */}
      <Testimonials />     {/* tinted */}
      <DiscordCommunity /> {/* transparent */}
      <JoinCta />          {/* transparent, dramatic finish */}
    </>
  );
}
