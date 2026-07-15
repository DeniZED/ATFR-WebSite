import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { AmbientBackground } from './AmbientBackground';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
}
