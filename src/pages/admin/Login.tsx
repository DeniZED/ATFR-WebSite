import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Alert, Button, Card, CardBody, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const from =
      (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin';
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message ?? 'Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-atfr-ink flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 text-atfr-gold mb-4">
              <Lock size={22} />
            </div>
            <h1 className="font-display text-2xl text-atfr-bone">
              Administration ATFR
            </h1>
            <p className="text-sm text-atfr-fog mt-1">
              Accès réservé aux officiers
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
            <Input
              label="Mot de passe"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
            {error && <Alert tone="danger">{error}</Alert>}
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
