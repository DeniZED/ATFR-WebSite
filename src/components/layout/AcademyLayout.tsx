import { AcademyNavbar } from './AcademyNavbar';
import { AcademyFooter } from './AcademyFooter';
import { PageTransition } from './PageTransition';
import { AmbientBackground } from './AmbientBackground';

export function AcademyLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AmbientBackground />
      <AcademyNavbar />
      <main className="flex-1 pt-16">
        <PageTransition />
      </main>
      <AcademyFooter />
    </div>
  );
}
