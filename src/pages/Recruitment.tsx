import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, ChevronLeft, ChevronRight, Search, Send } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Input,
  Section,
  Select,
  Textarea,
} from '@/components/ui';
import { CLANS } from '@/lib/constants';
import {
  applicationSchema,
  serializeAvailability,
  type ApplicationValue,
} from '@/features/applications/schema';
import { usePlayerLookup } from '@/features/stats/queries';
import { useSubmitApplication } from '@/features/applications/queries';
import { AvailabilityPicker } from '@/components/recruitment/AvailabilityPicker';
import { PlayerLookupCard } from '@/components/recruitment/PlayerLookupCard';

const steps = [
  { id: 1, label: 'Identité' },
  { id: 2, label: 'Disponibilités' },
  { id: 3, label: 'Motivation' },
] as const;

export default function Recruitment() {
  const [step, setStep] = useState<number>(1);
  const [lookupName, setLookupName] = useState('');

  const form = useForm<ApplicationValue>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur',
    defaultValues: {
      playerName: '',
      discordTag: '',
      targetClan: 'ATFR',
      availability: { days: [], slots: [] },
      motivation: '',
      previousClans: '',
    },
  });

  const { handleSubmit, control, register, watch, formState } = form;
  const errors = formState.errors;

  const playerName = watch('playerName');
  const lookup = usePlayerLookup(lookupName, lookupName.length >= 3);

  const submit = useSubmitApplication();
  const submitted = submit.isSuccess;

  const canGoNext = useMemo(() => {
    if (step === 1) {
      return playerName.trim().length >= 3 && !!watch('targetClan');
    }
    if (step === 2) {
      const a = watch('availability');
      return a.days.length > 0 && a.slots.length > 0;
    }
    return true;
  }, [step, playerName, watch]);

  async function onSubmit(values: ApplicationValue) {
    const result = lookup.data;
    await submit.mutateAsync({
      player_name: values.playerName,
      account_id: result?.player.account_id ?? null,
      discord_tag: values.discordTag,
      target_clan: values.targetClan,
      wn8: result?.tomato.wn8 ?? null,
      win_rate: result?.info?.win_rate ?? null,
      battles: result?.info?.battles ?? null,
      tier10_count: result?.tomato.tier10Count ?? null,
      availability: serializeAvailability(values.availability),
      motivation: values.motivation,
      previous_clans: values.previousClans || null,
    });
  }

  if (submitted) {
    return (
      <Section eyebrow="Merci" title="Candidature envoyée">
        <Card className="max-w-xl mx-auto">
          <CardBody className="text-center py-10">
            <CheckCircle2 size={48} className="mx-auto text-atfr-success mb-4" />
            <p className="text-atfr-bone text-lg">
              Votre candidature a bien été reçue.
            </p>
            <p className="text-atfr-fog mt-2 text-sm">
              Un officier du clan vous recontactera sous quelques jours sur
              Discord.
            </p>
          </CardBody>
        </Card>
      </Section>
    );
  }

  return (
    <Section
      eyebrow="Recrutement"
      title="Rejoindre le clan"
      description="Formulaire en 3 étapes. Vos stats publiques sont vérifiées en direct via l'API Wargaming et tomato.gg pour faciliter la review."
    >
      <div className="max-w-3xl mx-auto">
        <ol className="flex items-center justify-center gap-4 mb-10">
          {steps.map((s, idx) => (
            <li key={s.id} className="flex items-center gap-4">
              <div
                className={
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ' +
                  (step >= s.id
                    ? 'bg-atfr-gold text-atfr-ink'
                    : 'bg-atfr-graphite text-atfr-fog')
                }
              >
                {s.id}
              </div>
              <span
                className={
                  step === s.id ? 'text-atfr-bone' : 'text-atfr-fog text-sm'
                }
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && (
                <span className="h-px w-10 bg-atfr-gold/20" />
              )}
            </li>
          ))}
        </ol>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {step === 1 && (
            <Card>
              <CardBody className="p-6 space-y-5">
                <Select
                  label="Clan visé"
                  {...register('targetClan')}
                  error={errors.targetClan?.message}
                >
                  {CLANS.map((c) => (
                    <option key={c.tag} value={c.tag}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <div className="space-y-2">
                  <Input
                    label="Pseudo World of Tanks (EU)"
                    placeholder="ex. MonPseudoWOT"
                    {...register('playerName')}
                    error={errors.playerName?.message}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leadingIcon={<Search size={14} />}
                    onClick={() => setLookupName(playerName.trim())}
                    disabled={!playerName || playerName.trim().length < 3}
                  >
                    Vérifier mes stats
                  </Button>
                </div>

                {lookupName && (
                  <PlayerLookupCard
                    loading={lookup.isFetching}
                    data={lookup.data}
                    error={lookup.error}
                  />
                )}

                <Input
                  label="Discord"
                  placeholder="pseudo ou pseudo#0000"
                  {...register('discordTag')}
                  error={errors.discordTag?.message}
                />
              </CardBody>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardBody className="p-6">
                <Controller
                  control={control}
                  name="availability"
                  render={({ field, fieldState }) => (
                    <AvailabilityPicker
                      days={field.value.days}
                      slots={field.value.slots}
                      onChange={(v) =>
                        field.onChange({ days: v.days, slots: v.slots })
                      }
                      error={
                        fieldState.error?.message ??
                        errors.availability?.days?.message ??
                        errors.availability?.slots?.message
                      }
                    />
                  )}
                />
              </CardBody>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardBody className="p-6 space-y-5">
                <Input
                  label="Clans précédents (optionnel)"
                  placeholder="Ex : NOOB, PLAYY, …"
                  {...register('previousClans')}
                  error={errors.previousClans?.message}
                />
                <Textarea
                  label="Motivation"
                  placeholder="Parlez-nous de vous : expérience, objectifs, ce que vous cherchez dans un clan…"
                  {...register('motivation')}
                  error={errors.motivation?.message}
                />
                <p className="text-xs text-atfr-fog/80">
                  En envoyant ce formulaire, vous acceptez que nous utilisions
                  vos informations pour étudier votre candidature.
                </p>
              </CardBody>
            </Card>
          )}

          {submit.isError && (
            <Alert tone="danger" title="Échec de l'envoi">
              {(submit.error as Error).message ?? 'Réessayez dans un instant.'}
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              leadingIcon={<ChevronLeft size={16} />}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Précédent
            </Button>

            {step < steps.length ? (
              <Button
                type="button"
                trailingIcon={<ChevronRight size={16} />}
                onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
                disabled={!canGoNext}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                leadingIcon={<Send size={16} />}
                disabled={submit.isPending}
              >
                {submit.isPending ? 'Envoi…' : 'Envoyer ma candidature'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Section>
  );
}
