import { AcademyNavbar } from './AcademyNavbar';
import { AcademyFooter } from './AcademyFooter';
import { PageTransition } from './PageTransition';

export function AcademyLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-atfr-graphite">
      {/* Fond subtil différent du site clan */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(900px 500px at 50% 0%, rgba(232,176,67,0.06), transparent 70%), linear-gradient(180deg, #1C1D22 0%, #121316 100%)',
        }}
        aria-hidden
      />
      <AcademyNavbar />
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>
      <AcademyFooter />
    </div>
  );
}
