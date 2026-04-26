import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, CardBody, Section, Spinner } from '@/components/ui';
import { PlayerIdentityStorage } from '@/features/identity/usePlayerIdentity';

/**
 * Handles the redirect from Wargaming OpenID. Reads the URL params
 * (status, account_id, nickname, access_token, expires_at), stores
 * them in localStorage, then bounces back to wherever the user was.
 *
 * The redirect_uri must be registered in your WG developer app under
 * https://developers.wargaming.net/applications/ for the callback to
 * be reachable.
 */
export default function AuthWgCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'ok') {
      const accountIdRaw = params.get('account_id');
      const nickname = params.get('nickname');
      const accessToken = params.get('access_token');
      const expiresAtRaw = params.get('expires_at');
      const accountId = accountIdRaw ? Number(accountIdRaw) : NaN;
      const expiresAt = expiresAtRaw ? Number(expiresAtRaw) : NaN;
      if (
        Number.isFinite(accountId) &&
        nickname &&
        accessToken &&
        Number.isFinite(expiresAt)
      ) {
        PlayerIdentityStorage.saveVerified({
          accountId,
          nickname,
          accessToken,
          expiresAt,
        });
        const ret = PlayerIdentityStorage.popReturnUrl();
        navigate(ret, { replace: true });
        return;
      }
      setError('Réponse Wargaming incomplète.');
      return;
    }
    if (status === 'error') {
      setError(params.get('message') ?? 'Connexion Wargaming refusée.');
      return;
    }
    setError('Réponse Wargaming inattendue.');
  }, [navigate]);

  return (
    <Section eyebrow="Connexion" title="Wargaming">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-8 text-center space-y-4">
          {error ? (
            <>
              <Alert tone="danger" title="Connexion impossible">
                {error}
              </Alert>
              <p className="text-sm text-atfr-fog">
                Vérifie que ton application Wargaming a bien
                <code className="mx-1 text-atfr-gold">
                  {window.location.origin}/auth/wg/callback
                </code>
                dans les redirect_uri autorisés.
              </p>
            </>
          ) : (
            <>
              <Spinner label="Récupération de ton compte WG…" />
              <p className="text-xs text-atfr-fog">Tu vas être redirigé.</p>
            </>
          )}
        </CardBody>
      </Card>
    </Section>
  );
}
