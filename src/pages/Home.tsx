import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { About } from '@/components/sections/About';
import { Activities } from '@/components/sections/Activities';
import { TopPlayers } from '@/components/sections/TopPlayers';
import { JoinCta } from '@/components/sections/JoinCta';

export default function Home() {
  return (
    <>
      <Hero />
      <LiveStats />
      <About />
      <TopPlayers />
      <Activities />
      <JoinCta />
    </>
  );
}
