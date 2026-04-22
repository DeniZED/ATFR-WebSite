import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-[clamp(5rem,18vw,12rem)] leading-none text-gradient-gold">
        404
      </p>
      <h1 className="font-display text-3xl text-atfr-bone mt-4">
        Cette position n'existe pas sur la carte.
      </h1>
      <p className="mt-3 text-atfr-fog max-w-md">
        La page que vous cherchez a été déplacée ou n'a jamais existé.
      </p>
      <Link to="/" className="mt-8">
        <Button size="lg">Retour au QG</Button>
      </Link>
    </div>
  );
}
