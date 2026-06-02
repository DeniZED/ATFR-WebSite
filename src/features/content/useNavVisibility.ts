import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface NavVisibility {
  events: boolean;
  gallery: boolean;
  members: boolean;
}

async function fetchVisibility(): Promise<NavVisibility> {
  const [events, gallery, members] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('starts_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
    supabase
      .from('media_assets')
      .select('id', { count: 'exact', head: true })
      .eq('is_gallery_visible', true),
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .limit(1),
  ]);
  return {
    events: (events.count ?? 0) > 0,
    gallery: (gallery.count ?? 0) > 0,
    members: (members.count ?? 0) > 0,
  };
}

export function useNavVisibility() {
  return useQuery({
    queryKey: ['nav_visibility'],
    queryFn: fetchVisibility,
    staleTime: 5 * 60 * 1000, // 5 min
    gcTime: 10 * 60 * 1000,
  });
}
