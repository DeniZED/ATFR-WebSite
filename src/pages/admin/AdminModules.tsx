import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Save } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Switch,
  Textarea,
} from '@/components/ui';
import { useAdminModules, useUpsertModule } from '@/features/modules/queries';

interface DraftRow {
  is_published: boolean;
  sort_order: number;
  badge_label: string;
  custom_title: string;
  custom_description: string;
}

const empty: DraftRow = {
  is_published: false,
  sort_order: 0,
  badge_label: '',
  custom_title: '',
  custom_description: '',
};

export default function AdminModules() {
  const { data, isLoading } = useAdminModules();
  const upsert = useUpsertModule();

  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, DraftRow> = {};
    for (const { registry, row } of data) {
      next[registry.slug] = {
        is_published: row?.is_published ?? false,
        sort_order: row?.sort_order ?? 0,
        badge_label: row?.badge_label ?? '',
        custom_title: row?.custom_title ?? '',
        custom_description: row?.custom_description ?? '',
      };
    }
    setDrafts(next);
  }, [data]);

  const dirtySlugs = useMemo(() => {
    if (!data) return [] as string[];
    return data
      .filter(({ registry, row }) => {
        const d = drafts[registry.slug];
        if (!d) return false;
        const r = row;
        return (
          d.is_published !== (r?.is_published ?? false) ||
          d.sort_order !== (r?.sort_order ?? 0) ||
          d.badge_label !== (r?.badge_label ?? '') ||
          d.custom_title !== (r?.custom_title ?? '') ||
          d.custom_description !== (r?.custom_description ?? '')
        );
      })
      .map(({ registry }) => registry.slug);
  }, [data, drafts]);

  function update(slug: string, patch: Partial<DraftRow>) {
    setDrafts((prev) => ({
      ...prev,
      [slug]: { ...(prev[slug] ?? empty), ...patch },
    }));
  }

  async function save() {
    if (!data) return;
    for (const slug of dirtySlugs) {
      const d = drafts[slug];
      await upsert.mutateAsync({
        slug,
        is_published: d.is_published,
        sort_order: d.sort_order,
        badge_label: d.badge_label || null,
        custom_title: d.custom_title || null,
        custom_description: d.custom_description || null,
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap sticky top-0 z-20 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-atfr-ink/85 backdrop-blur border-b border-atfr-gold/10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Académie
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Modules & mini-jeux</h1>
          <p className="text-sm text-atfr-fog mt-1">
            Choisis quels modules sont visibles sur la page publique
            <code className="ml-1 text-atfr-gold">/modules</code>. Les modules
            sont définis dans le code et déployés au fur et à mesure.
          </p>
        </div>
        <Button
          onClick={save}
          disabled={dirtySlugs.length === 0 || upsert.isPending}
          leadingIcon={<Save size={14} />}
        >
          {upsert.isPending
            ? 'Enregistrement…'
            : dirtySlugs.length > 0
              ? `Enregistrer (${dirtySlugs.length})`
              : 'Aucune modification'}
        </Button>
      </div>

      {upsert.isError && (
        <Alert tone="danger" title="Erreur">
          {(upsert.error as Error).message}
        </Alert>
      )}

      {isLoading || !data ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="grid gap-4">
          {data.map(({ registry, row }) => {
            const d = drafts[registry.slug] ?? empty;
            const Icon = registry.icon;
            return (
              <Card key={registry.slug}>
                <CardBody className="p-5 grid gap-5 lg:grid-cols-[1fr,2fr]">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg border border-atfr-gold/40 bg-atfr-ink/60 flex items-center justify-center text-atfr-gold shrink-0">
                      <Icon size={22} strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg text-atfr-bone">
                          {registry.title}
                        </h3>
                        {registry.comingSoon && (
                          <Badge variant="neutral">Stub</Badge>
                        )}
                      </div>
                      <p className="text-xs text-atfr-fog mt-1">
                        slug · <code>{registry.slug}</code>
                      </p>
                      <p className="text-xs text-atfr-fog mt-1">
                        URL · <code>/modules/{registry.path}</code>
                      </p>
                      <p className="text-sm text-atfr-fog mt-3">
                        {registry.description}
                      </p>
                      {row && (
                        <a
                          href={`/modules/${registry.path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1 text-xs text-atfr-gold hover:underline"
                        >
                          Aperçu public <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Switch
                        checked={d.is_published}
                        onChange={(next) =>
                          update(registry.slug, { is_published: next })
                        }
                        label={
                          <>
                            Publier sur la page <code>/modules</code>
                          </>
                        }
                        hint={
                          d.is_published
                            ? 'Visible publiquement.'
                            : 'Masqué — visible uniquement par les admins.'
                        }
                      />
                    </div>

                    <Input
                      label="Ordre d'affichage"
                      type="number"
                      value={d.sort_order}
                      onChange={(e) =>
                        update(registry.slug, {
                          sort_order: Number(e.target.value),
                        })
                      }
                    />
                    <Input
                      label="Badge (ex. Nouveau, Bêta, Bientôt)"
                      value={d.badge_label}
                      onChange={(e) =>
                        update(registry.slug, { badge_label: e.target.value })
                      }
                      placeholder=""
                    />
                    <Input
                      label="Titre personnalisé (override)"
                      value={d.custom_title}
                      onChange={(e) =>
                        update(registry.slug, { custom_title: e.target.value })
                      }
                      placeholder={registry.title}
                      className="sm:col-span-2"
                    />
                    <Textarea
                      label="Description personnalisée (override)"
                      value={d.custom_description}
                      onChange={(e) =>
                        update(registry.slug, {
                          custom_description: e.target.value,
                        })
                      }
                      placeholder={registry.description}
                      rows={3}
                      className="sm:col-span-2"
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
