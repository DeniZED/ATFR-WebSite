import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileJson, Pencil } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Spinner,
} from '@/components/ui';
import type { ClanContentKey, ClanPageContentRow } from '@/types/database';
import {
  useAdminClanPageContent,
  useUpdateClanPageContent,
} from '@/features/clan/pageQueries';

const CONTENT_LABELS: Record<ClanContentKey, string> = {
  doctrine: 'Doctrine',
  links: 'Ressources / liens',
  maps: 'Fiches cartes',
  roles: 'Rôles & gameplay',
  strategies: 'Tactiques',
  tanks: 'Fiches chars',
};

/** Nombre d'entrées de premier niveau du payload (sections, liens, chars…). */
function countEntries(payload: Record<string, unknown>): number | null {
  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value.length;
  }
  return null;
}

export default function AdminClanContent() {
  const list = useAdminClanPageContent();
  const [editing, setEditing] = useState<ClanPageContentRow | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/pages-clan"
          className="inline-flex items-center gap-1 text-xs text-atfr-fog hover:text-atfr-gold mb-2"
        >
          <ArrowLeft size={12} /> Pages clan
        </Link>
        <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
          Contenu
        </p>
        <h1 className="font-display text-3xl text-atfr-bone">Contenu clan</h1>
        <p className="text-sm text-atfr-fog mt-1 max-w-xl">
          Édite le contenu réservé des pages clan (doctrine, tactiques, fiches
          chars…). Le format est du JSON : conserve la même structure que
          l'existant, la validation ne vérifie que la syntaxe.
        </p>
      </div>

      {editing && (
        <ContentEditor row={editing} onClose={() => setEditing(null)} />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : list.isError ? (
        <Alert tone="danger" title="Erreur de chargement">
          {(list.error as Error).message}
        </Alert>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucun contenu — applique la migration 0046 (seed) sur Supabase.
        </p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((row) => {
            const count = countEntries(row.payload);
            return (
              <Card key={`${row.page_slug}:${row.content_key}`}>
                <CardBody className="p-5 flex items-center gap-4 flex-wrap">
                  <div className="h-12 w-12 shrink-0 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
                    <FileJson size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-lg text-atfr-bone">
                        {CONTENT_LABELS[row.content_key] ?? row.content_key}
                      </h3>
                      <code className="text-xs text-atfr-gold/70">
                        {row.page_slug} · {row.content_key}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs text-atfr-fog">
                      {count !== null && (
                        <Badge variant="neutral">{count} entrée{count > 1 ? 's' : ''}</Badge>
                      )}
                      <span>
                        Mis à jour le{' '}
                        {new Date(row.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => setEditing(row)}
                  >
                    Modifier
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ContentEditor({
  row,
  onClose,
}: {
  row: ClanPageContentRow;
  onClose: () => void;
}) {
  const update = useUpdateClanPageContent();
  const [text, setText] = useState(() => JSON.stringify(row.payload, null, 2));
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError(
        `JSON invalide : ${e instanceof Error ? e.message : 'erreur de syntaxe'}`,
      );
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setError('Le JSON doit être un objet (pas un tableau ni une valeur simple).');
      return;
    }
    try {
      await update.mutateAsync({
        page_slug: row.page_slug,
        content_key: row.content_key,
        payload: parsed as Record<string, unknown>,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Échec de l’enregistrement.');
    }
  }

  return (
    <Card>
      <CardBody className="p-5 space-y-4">
        <div>
          <h2 className="font-display text-xl text-atfr-bone">
            {CONTENT_LABELS[row.content_key] ?? row.content_key}
          </h2>
          <p className="text-xs text-atfr-fog mt-1">
            <code>{row.page_slug} · {row.content_key}</code> — modifie avec
            précaution : la structure doit rester identique (mêmes clés), sinon
            la page correspondante s'affichera vide.
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={24}
          spellCheck={false}
          aria-label={`Contenu JSON — ${CONTENT_LABELS[row.content_key] ?? row.content_key}`}
          className="w-full rounded-lg border border-atfr-gold/20 bg-atfr-ink/60 p-3 font-mono text-xs text-atfr-bone focus:outline-none focus:ring-2 focus:ring-atfr-gold/60"
        />

        {error && (
          <Alert tone="danger" title="Impossible d'enregistrer">
            {error}
          </Alert>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
