import { Link } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { Button, Card, CardBody, Section } from '@/components/ui';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { useClanMembership } from '@/features/clan/ClanMembershipContext';
import { env } from '@/lib/env';

interface Props {
  moduleTitle: string;
  moduleDescription: string;
}

export function ModuleGate({ moduleTitle, moduleDescription }: Props) {
  const identity = usePlayerIdentity();
  const { isMember, isLoading } = useClanMembership();

  return (
    <Section eyebrow="Académie" title={moduleTitle} description={moduleDescription}>
      <Card className="max-w-xl mx-auto">
        <CardBody className="p-8 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-atfr-gold/40 bg-atfr-gold/5">
            <Lock size={28} className="text-atfr-gold" strokeWidth={1.5} />
          </div>

          <div>
            <p className="font-display text-2xl text-atfr-bone">
              Réservé aux membres {env.clanTag}
            </p>
            <p className="text-sm text-atfr-fog mt-3 leading-relaxed">
              Ce module est une initiative du clan {env.clanTag} pour ses membres.
              Rejois le clan pour y accéder et bénéficier de contenu exclusif.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {!identity.isVerified && env.wotApplicationId ? (
              <Button
                onClick={() => identity.startWgLogin()}
                leadingIcon={<LogIn size={14} />}
                className="w-full"
              >
                Se connecter avec Wargaming
              </Button>
            ) : isLoading ? (
              <div className="text-sm text-atfr-fog/60 py-2">
                Vérification de l'appartenance au clan…
              </div>
            ) : !isMember ? (
              <Link to="/recrutement" className="block">
                <Button className="w-full">Rejoindre {env.clanTag}</Button>
              </Link>
            ) : null}

            <Link to="/modules" className="block">
              <Button variant="outline" className="w-full">
                Retour aux modules
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </Section>
  );
}
