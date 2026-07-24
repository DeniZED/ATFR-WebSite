import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useInvalidatingMutation } from '@/lib/mutation-factory';
import { supabase } from '@/lib/supabase';
import type {
  ClanMemberMovementRow,
  ClanMovementContactStatus,
  PlayerRow,
} from '@/types/database';

export function useClanMovements(options: { limit?: number; enabled?: boolean } = {}) {
  const limit = options.limit ?? 300;
  return useQuery({
    queryKey: ['clan-movements', limit],
    enabled: options.enabled ?? true,
    queryFn: async (): Promise<ClanMemberMovementRow[]> => {
      const { data, error } = await supabase
        .from('clan_member_movements')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ClanMemberMovementRow[];
    },
    staleTime: 30_000,
    refetchInterval: 5 * 60_000,
  });
}

export interface UpdateMovementContactStatusInput {
  movementId: string;
  contactStatus: ClanMovementContactStatus;
}

export function useUpdateMovementContactStatus() {
  return useInvalidatingMutation({
    successToast: 'Statut de contact mis à jour.',
    mutationFn: async ({ movementId, contactStatus }: UpdateMovementContactStatusInput) => {
      const { error } = await supabase
        .from('clan_member_movements')
        .update({ contact_status: contactStatus })
        .eq('id', movementId);
      if (error) throw error;
    },
    invalidates: [['clan-movements']],
  });
}

export function useCreateProspectFromMovement() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Prospect créé dans le suivi RH.' },
    mutationFn: async (movement: ClanMemberMovementRow): Promise<PlayerRow> => {
      const existing = await supabase
        .from('players')
        .select('*')
        .eq('account_id', movement.account_id)
        .maybeSingle();
      if (existing.error) throw existing.error;

      let player = existing.data as PlayerRow | null;

      if (!player) {
        const inserted = await supabase
          .from('players')
          .insert({
            nickname: movement.account_name,
            account_id: movement.account_id,
            current_clan_id: movement.event === 'join' ? movement.clan_id : null,
            current_clan_tag: movement.event === 'join' ? movement.clan_tag : null,
            status: 'prospect',
            source: 'manual',
            tags: ['recrutement'],
          })
          .select('*')
          .single();
        if (inserted.error) throw inserted.error;
        player = inserted.data as PlayerRow;

        const clanLabel = movement.clan_tag ? `[${movement.clan_tag}]` : `#${movement.clan_id}`;
        const eventLabel = movement.event === 'leave' ? 'sortie de' : 'entrée dans';
        const date = new Date(movement.occurred_at).toLocaleDateString('fr-FR');
        const note = await supabase.from('player_staff_notes').insert({
          player_id: player.id,
          note_type: 'recruitment',
          content: `Repéré via mouvement de clan : ${eventLabel} ${clanLabel} le ${date}.`,
        });
        if (note.error) throw note.error;
      }

      const updated = await supabase
        .from('clan_member_movements')
        .update({ contact_status: 'linked', linked_player_id: player.id })
        .eq('id', movement.id);
      if (updated.error) throw updated.error;

      return player;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clan-movements'] });
      await qc.invalidateQueries({ queryKey: ['hr'] });
    },
  });
}
