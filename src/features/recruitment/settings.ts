import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RecruitmentSettingsRow } from '@/types/database';

const QUERY_KEY = ['recruitment-settings'] as const;

export function useRecruitmentSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<RecruitmentSettingsRow> => {
      const { data, error } = await supabase
        .from('recruitment_settings')
        .select('*')
        .eq('id', true)
        .single();
      if (error) throw error;
      return data as RecruitmentSettingsRow;
    },
    staleTime: 60_000,
  });
}

export type RecruitmentSettingsPatch = Partial<
  Pick<
    RecruitmentSettingsRow,
    'min_wn8' | 'min_battles' | 'weight_wn8' | 'weight_winrate' | 'weight_battles' | 'weight_tier10'
  >
>;

export function useUpdateRecruitmentSettings() {
  const qc = useQueryClient();
  return useMutation({
    meta: { successToast: 'Paramètres de recrutement enregistrés.', silentError: true },
    mutationFn: async (patch: RecruitmentSettingsPatch) => {
      const { data, error } = await supabase
        .from('recruitment_settings')
        .update(patch)
        .eq('id', true)
        .select('*')
        .single();
      if (error) throw error;
      return data as RecruitmentSettingsRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
