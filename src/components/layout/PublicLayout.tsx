import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>
      <Footer />
    </div>
  );
}
