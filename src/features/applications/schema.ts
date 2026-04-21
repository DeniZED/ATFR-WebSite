import { z } from 'zod';
import { DAYS, TIME_SLOTS } from '@/lib/constants';

const dayValues = DAYS as readonly [string, ...string[]];
const slotValues = TIME_SLOTS.map((s) => s.id) as [string, ...string[]];

export const availabilitySchema = z.object({
  days: z.array(z.enum(dayValues)).min(1, 'Sélectionnez au moins un jour'),
  slots: z
    .array(z.enum(slotValues))
    .min(1, 'Sélectionnez au moins une plage horaire'),
});

export type AvailabilityValue = z.infer<typeof availabilitySchema>;

export const applicationSchema = z.object({
  playerName: z
    .string()
    .min(3, 'Pseudo WoT requis (min. 3 caractères)')
    .max(40),
  accountId: z.number().int().optional(),
  discordTag: z
    .string()
    .trim()
    .min(2, 'Pseudo Discord requis')
    .max(64, 'Trop long')
    .regex(/^[a-zA-Z0-9_.\-#]{2,}$/, 'Format Discord invalide'),
  targetClan: z.enum(['ATFR', 'A-T-O']),
  availability: availabilitySchema,
  motivation: z
    .string()
    .min(30, 'Décrivez un peu plus votre motivation (30 caractères min.)')
    .max(2000),
  previousClans: z.string().max(500).optional(),
});

export type ApplicationValue = z.infer<typeof applicationSchema>;

export function serializeAvailability(v: AvailabilityValue): string {
  const days = v.days.join(', ');
  const slots = TIME_SLOTS.filter((s) => (v.slots as string[]).includes(s.id))
    .map((s) => s.label)
    .join(', ');
  return `${days} — ${slots}`;
}
