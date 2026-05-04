import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, CardBody, Section, Spinner } from '@/components/ui';
import { PlayerIdentityStorage } from '@/features/identity/usePlayerIdentity';

/**
 * Handles the redirect from Wargaming OAuth. After a CSRF nonce check and
 * server-side token verification via /.netlify/functions/wg-auth-verify, the
 * identity is stored and the user is bounced back to their original page.
 */
export default function AuthWgCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function process() {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');

      // 1. CSRF nonce check — prevent Login CSRF and forged callback URLs.
      //    The nonce was generated in startWgLogin() and echoed back by WG
      //    via the `state` parameter.
      const returnedNonce = params.get('state');
      const storedNonce = PlayerIdentityStorage.popNonce();
      if (!returnedNonce || !storedNonce || returnedNonce !== storedNonce) {
        setError('Validation CSRF échouée. Recommence la connexion depuis le site.');
        return;
      }

      if (status === 'error') {
        setError(params.get('message') ?? 'Connexion Wargaming refusée.');
        return;
      }

      if (status !== 'ok') {
        setError('Réponse Wargaming inattendue.');
        return;
      }

      const accountIdRaw = params.get('account_id');
      const nickname = params.get('nickname');
      const accessToken = params.get('access_token');
      const accountId = accountIdRaw ? Number(accountIdRaw) : NaN;

      if (!Number.isFinite(accountId) || !nickname || !accessToken) {
        setError('Réponse Wargaming incomplète.');
        return;
      }

      // 2. Server-side verification — call our Netlify function which uses
      //    WG prolongate to confirm the token genuinely belongs to account_id.
      //    This prevents an attacker from forging (account_id, access_token).
      let verified: { ok: boolean; account_id: number; access_token: string; expires_at: number | null };
      try {
        const res = await fetch('/.netlify/functions/wg-auth-verify', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ account_id: accountId, access_token: accessToken }),
          signal: AbortSignal.timeout(12_000),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(
            body?.error === 'Token rejected by Wargaming'
              ? 'Token Wargaming invalide. Reconnecte-toi.'
              : 'Vérification du compte impossible. Réessaie.',
          );
          return;
        }
        verified = await res.json();
      } catch {
        setError('Erreur réseau lors de la vérification. Réessaie.');
        return;
      }

      if (!verified.ok || verified.account_id !== accountId) {
        setError('Le token ne correspond pas au compte déclaré.');
        return;
      }

      PlayerIdentityStorage.saveVerified({
        accountId: verified.account_id,
        nickname,
        accessToken: verified.access_token,
        expiresAt: verified.expires_at ?? Number(params.get('expires_at') ?? 0),
      });

      const ret = PlayerIdentityStorage.popReturnUrl();
      navigate(ret, { replace: true });
    }

    process().catch(() => setError('Erreur inattendue lors de la connexion.'));
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
              <Spinner label="Vérification du compte WG…" />
              <p className="text-xs text-atfr-fog">Tu vas être redirigé.</p>
            </>
          )}
        </CardBody>
      </Card>
    </Section>
  );
}
