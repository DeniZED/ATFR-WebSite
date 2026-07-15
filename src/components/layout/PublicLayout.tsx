import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { TacticalBackground } from './TacticalBackground';
import { ReadingProgress } from './ReadingProgress';
import { useSpotlight } from '@/hooks/useSpotlight';

export function PublicLayout() {
  useSpotlight();
  return (
    <div className="min-h-screen flex flex-col">
      <TacticalBackground />
      <ReadingProgress />
      <Navbar />
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
}
