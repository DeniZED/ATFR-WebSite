import { useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
  Textarea,
} from '@/components/ui';
import { useSiteContent, useUpdateSiteContent } from '@/features/content/queries';
import { MediaPicker } from '@/components/admin/MediaPicker';

const GROUPS: Array<{ title: string; keys: string[] }> = [
  {
    title: 'Hero',
    keys: [
      'hero_video_url',
      'hero_poster_url',
      'hero_eyebrow',
      'hero_title',
      'hero_subtitle',
      'hero_cta_primary',
      'hero_cta_secondary',
    ],
  },
  {
    title: 'À propos',
    keys: ['about_eyebrow', 'about_title', 'about_text'],
  },
  {
    title: 'Activités',
    keys: [
      'activities_eyebrow',
      'activities_title',
      'activity_1_title',
      'activity_1_text',
      'activity_1_image',
      'activity_2_title',
      'activity_2_text',
      'activity_2_image',
      'activity_3_title',
      'activity_3_text',
      'activity_3_image',
    ],
  },
  {
    title: 'Sections',
    keys: [
      'highlights_eyebrow',
      'highlights_title',
      'achievements_eyebrow',
      'achievements_title',
      'testimonials_eyebrow',
      'testimonials_title',
    ],
  },
  {
    title: 'Discord',
    keys: ['discord_server_id', 'discord_invite_url'],
  },
  {
    title: 'Appel à l’action',
    keys: ['cta_title', 'cta_text'],
  },
];

export default function AdminContent() {
  const { data: content, isLoading } = useSiteContent();
  const update = useUpdateSiteContent();
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!content) return;
    const initial: Record<string, string> = {};
    for (const key of Object.keys(content)) initial[key] = content[key].value;
    setValues(initial);
  }, [content]);

  const dirtyKeys = useMemo(() => {
    if (!content) return [];
    return Object.keys(values).filter(
      (k) => content[k] && values[k] !== content[k].value,
    );
  }, [content, values]);

  async function save() {
    if (!content || dirtyKeys.length === 0) return;
    await update.mutateAsync(
      dirtyKeys.map((k) => ({ key: k, value: values[k] })),
    );
  }

  if (isLoading || !content) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  // Any key present in DB but missing from GROUPS falls back into "Autres"
  // so newly-seeded keys are editable without code change.
  const known = new Set(GROUPS.flatMap((g) => g.keys));
  const extras = Object.keys(content).filter((k) => !known.has(k));
  const effectiveGroups =
    extras.length > 0
      ? [...GROUPS, { title: 'Autres', keys: extras }]
      : GROUPS;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap sticky top-0 z-20 -mx-6 lg:-mx-10 px-6 lg:px-10 py-4 bg-atfr-ink/85 backdrop-blur border-b border-atfr-gold/10">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-atfr-gold mb-1">
            Édition
          </p>
          <h1 className="font-display text-3xl text-atfr-bone">Contenu du site</h1>
          <p className="text-sm text-atfr-fog mt-1">
            Ces textes sont lus en live par la page d’accueil.
          </p>
        </div>
        <Button
          onClick={save}
          disabled={dirtyKeys.length === 0 || update.isPending}
          leadingIcon={<Save size={14} />}
        >
          {update.isPending
            ? 'Enregistrement…'
            : dirtyKeys.length > 0
              ? `Enregistrer (${dirtyKeys.length})`
              : 'Aucune modification'}
        </Button>
      </div>

      {update.isError && (
        <Alert tone="danger" title="Erreur">
          {(update.error as Error).message}
        </Alert>
      )}
      {update.isSuccess && dirtyKeys.length === 0 && (
        <Alert tone="success">Contenu mis à jour.</Alert>
      )}

      {effectiveGroups.map((group) => (
        <Card key={group.title}>
          <CardBody className="p-5 space-y-4">
            <h2 className="font-display text-lg text-atfr-bone">{group.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.keys
                .filter((k) => content[k])
                .map((key) => {
                  const row = content[key];
                  const val = values[key] ?? '';
                  const label = row.label ?? key;
                  const onChange = (v: string) =>
                    setValues((prev) => ({ ...prev, [key]: v }));

                  if (row.kind === 'video' || row.kind === 'image') {
                    return (
                      <div key={key} className="md:col-span-2">
                        <MediaPicker
                          label={label}
                          kind={row.kind}
                          value={val}
                          onChange={onChange}
                        />
                      </div>
                    );
                  }
                  if (row.kind === 'longtext') {
                    return (
                      <Textarea
                        key={key}
                        label={label}
                        value={val}
                        rows={4}
                        onChange={(e) => onChange(e.target.value)}
                        className="md:col-span-2"
                      />
                    );
                  }
                  return (
                    <Input
                      key={key}
                      label={label}
                      value={val}
                      onChange={(e) => onChange(e.target.value)}
                    />
                  );
                })}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
