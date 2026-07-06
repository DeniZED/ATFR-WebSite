import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileJson, Lock, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Textarea,
} from '@/components/ui';
import { getClanInfo } from '@/lib/wot-api';
import type { AllowedClan, ClanPageRow } from '@/types/database';
import {
  useClanPages,
  useDeleteClanPage,
  useUpsertClanPage,
} from '@/features/clan/pageQueries';
import { useConfirm } from '@/hooks/useConfirm';
import { FormActions } from '@/components/ui/FormActions';

export default function AdminClanPages() {
  const list = useClanPages();
  const remove = useDeleteClanPage();
  const confirmDialog = useConfirm();
  const [editing, setEditing] = useState<ClanPageRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Accès
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Pages clan</h1>
          <p className="text-sm text-atfr-fog mt-1 max-w-xl">
            Définis quels clans WoT ont accès à chaque page réservée. Un joueur
            connecté via Wargaming voit la page seulement si son clan figure
            dans la liste autorisée.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/pages-clan/contenu">
            <Button variant="outline" leadingIcon={<FileJson size={14} />}>
              Contenu clan
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditing(null);
              setCreating(true);
            }}
            leadingIcon={<Plus size={14} />}
          >
            Nouvelle page
          </Button>
        </div>
      </div>

      {(creating || editing) && (
        <ClanPageForm
          page={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {list.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !list.data || list.data.length === 0 ? (
        <p className="text-center text-atfr-fog py-10">
          Aucune page clan configurée.
        </p>
      ) : (
        <div className="grid gap-3">
          {list.data.map((p) => (
            <Card key={p.slug}>
              <CardBody className="p-5 flex items-start gap-4 flex-wrap">
                <div className="h-12 w-12 shrink-0 rounded-xl border border-atfr-gold/30 bg-atfr-gold/10 flex items-center justify-center text-atfr-gold">
                  <Lock size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-lg text-atfr-bone">
                      {p.title}
                    </h3>
                    <code className="text-xs text-atfr-gold/70">/{p.slug}</code>
                  </div>
                  {p.description && (
                    <p className="text-sm text-atfr-fog mb-2">{p.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {p.allowed_clans.length === 0 ? (
                      <Badge variant="neutral">Aucun clan autorisé</Badge>
                    ) : (
                      p.allowed_clans.map((c) => (
                        <Badge key={c.clan_id} variant="gold">
                          [{c.clan_tag}] {c.clan_id}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    leadingIcon={<Pencil size={14} />}
                    onClick={() => {
                      setCreating(false);
                      setEditing(p);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    leadingIcon={<Trash2 size={14} />}
                    onClick={async () => {
                      if (
                        await confirmDialog({
                          message: `Supprimer la page « ${p.title} » ?`,
                          tone: 'danger',
                          confirmLabel: 'Supprimer',
                        })
                      )
                        remove.mutate(p.slug);
                    }}
                    disabled={remove.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ClanPageForm({
  page,
  onClose,
}: {
  page: ClanPageRow | null;
  onClose: () => void;
}) {
  const upsert = useUpsertClanPage();
  const isNew = !page;

  const [slug, setSlug] = useState(page?.slug ?? '');
  const [title, setTitle] = useState(page?.title ?? '');
  const [description, setDescription] = useState(page?.description ?? '');
  const [clans, setClans] = useState<AllowedClan[]>(page?.allowed_clans ?? []);

  const [clanIdInput, setClanIdInput] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  async function addClan() {
    setLookupError(null);
    const id = clanIdInput.trim();
    if (!/^\d+$/.test(id)) {
      setLookupError('Saisis un ID de clan numérique.');
      return;
    }
    if (clans.some((c) => String(c.clan_id) === id)) {
      setLookupError('Ce clan est déjà dans la liste.');
      return;
    }
    setLooking(true);
    try {
      const info = await getClanInfo(id);
      if (!info) {
        setLookupError('Clan introuvable sur l’API WoT.');
        return;
      }
      setClans((prev) => [...prev, { clan_id: info.clan_id, clan_tag: info.tag }]);
      setClanIdInput('');
    } catch {
      setLookupError('Erreur lors de la vérification du clan.');
    } finally {
      setLooking(false);
    }
  }

  function removeClan(clanId: number) {
    setClans((prev) => prev.filter((c) => c.clan_id !== clanId));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    await upsert.mutateAsync({
      _isNew: isNew,
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || null,
      allowed_clans: clans,
    });
    onClose();
  }

  return (
    <Card>
      <CardBody className="p-5">
        <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Identifiant (slug)"
            value={slug}
            onChange={(e) =>
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
            }
            placeholder="clan-hub"
            required
            disabled={!isNew}
            hint={isNew ? 'Utilisé dans l’URL : /clan/<slug>' : 'Non modifiable'}
          />
          <Input
            label="Titre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Espace clan"
            required
          />
          <Textarea
            label="Description (optionnel)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="md:col-span-2"
          />

          <div className="md:col-span-2">
            <label className="block text-sm text-atfr-bone mb-2">
              Clans autorisés
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {clans.length === 0 ? (
                <p className="text-sm text-atfr-fog">
                  Aucun clan — la page sera inaccessible à tous.
                </p>
              ) : (
                clans.map((c) => (
                  <span
                    key={c.clan_id}
                    className="inline-flex items-center gap-2 rounded-lg border border-atfr-gold/30 bg-atfr-gold/10 px-3 py-1.5 text-sm text-atfr-gold"
                  >
                    <ShieldCheck size={14} />
                    [{c.clan_tag}] · {c.clan_id}
                    <button
                      type="button"
                      onClick={() => removeClan(c.clan_id)}
                      className="text-atfr-gold/70 hover:text-atfr-bone"
                      aria-label="Retirer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex items-end gap-2 flex-wrap">
              <Input
                label="Ajouter un clan (ID WoT)"
                value={clanIdInput}
                onChange={(e) => setClanIdInput(e.target.value)}
                placeholder="500191501"
                className="flex-1 min-w-[200px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addClan();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={addClan}
                disabled={looking}
                leadingIcon={<Plus size={14} />}
              >
                {looking ? 'Vérification…' : 'Ajouter'}
              </Button>
            </div>
            {lookupError && (
              <p className="text-xs text-red-400 mt-2">{lookupError}</p>
            )}
          </div>

          <FormActions className="md:col-span-2" onCancel={onClose} pending={upsert.isPending} />
        </form>
      </CardBody>
    </Card>
  );
}
