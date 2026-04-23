import { Hero } from '@/components/sections/Hero';
import { LiveStats } from '@/components/sections/LiveStats';
import { About } from '@/components/sections/About';
import { Activities } from '@/components/sections/Activities';
import { Highlights } from '@/components/sections/Highlights';
import { Achievements } from '@/components/sections/Achievements';
import { Testimonials } from '@/components/sections/Testimonials';
import { JoinCta } from '@/components/sections/JoinCta';

export default function Home() {
  return (
    <>
      <Hero />
      <LiveStats />
      <About />
      <Activities />
      <Highlights />
      <Achievements />
      <Testimonials />
      <JoinCta />
    </>
  );
}
