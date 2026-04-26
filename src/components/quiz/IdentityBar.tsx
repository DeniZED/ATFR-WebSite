import { useState, type FormEvent } from 'react';
import { LogIn, LogOut, Pencil, ShieldCheck, User } from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { usePlayerIdentity } from '@/features/identity/usePlayerIdentity';
import { env } from '@/lib/env';

/**
 * Small panel shown above a quiz / mini-game intro screen. Lets the
 * player choose between a free nickname (anon) or a verified
 * Wargaming login. Persists in localStorage.
 */
export function IdentityBar() {
  const id = usePlayerIdentity();
  const [editing, setEditing] = useState(!id.nickname);
  const [draft, setDraft] = useState(id.nickname);

  function save(e: FormEvent) {
    e.preventDefault();
    id.setNickname(draft);
    setEditing(false);
  }

  return (
    <Card>
      <CardBody className="p-5">
        {id.isVerified ? (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-atfr-success/15 border border-atfr-success/40 text-atfr-success">
              <ShieldCheck size={22} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-atfr-success">
                Compte Wargaming vérifié
              </p>
              <p className="font-display text-lg text-atfr-bone truncate">
                {id.nickname}
              </p>
              <p className="text-xs text-atfr-fog">
                ID · {id.accountId} — ton score apparaîtra dans le classement
                officiel.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={<LogOut size={14} />}
              onClick={() => id.logoutVerified()}
            >
              Déconnexion
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-atfr-gold/10 border border-atfr-gold/30 text-atfr-gold">
                <User size={22} strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-atfr-gold/80">
                  Joueur invité
                </p>
                {editing ? (
                  <form onSubmit={save} className="mt-1 flex gap-2">
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Ton pseudo"
                      maxLength={32}
                      autoFocus
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={draft.trim().length < 1}
                    >
                      OK
                    </Button>
                  </form>
                ) : (
                  <p className="font-display text-lg text-atfr-bone truncate">
                    {id.nickname || 'Choisis un pseudo'}
                  </p>
                )}
                <p className="text-xs text-atfr-fog mt-1">
                  Ton score sera enregistré localement et dans le classement
                  général sous ce pseudo.
                </p>
              </div>
              {!editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  leadingIcon={<Pencil size={14} />}
                  onClick={() => {
                    setDraft(id.nickname);
                    setEditing(true);
                  }}
                >
                  Modifier
                </Button>
              )}
            </div>

            {env.wotApplicationId && (
              <div className="border-t border-atfr-gold/10 pt-4">
                <p className="text-xs text-atfr-fog mb-3">
                  Pour apparaître dans le <strong>classement officiel ATFR</strong>{' '}
                  (vérifié), connecte-toi avec ton compte Wargaming.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  leadingIcon={<LogIn size={14} />}
                  onClick={() => id.startWgLogin()}
                >
                  Se connecter via Wargaming
                </Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
