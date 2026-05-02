-- ATFR - GeoGuesseur : correction du reset global pour Supabase safe update.
--
-- A executer dans le SQL Editor Supabase si 0014 a deja ete applique.
-- La clause WHERE explicite evite l'erreur "UPDATE requires a WHERE clause".

create or replace function public.reset_geoguesser_all_stats()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if not coalesce(public.is_editor(), false) then
    raise exception 'not_allowed';
  end if;

  update public.geoguesser_shots
     set attempt_count = 0,
         correct_map_count = 0,
         success_score_sum = 0,
         difficulty = 'easy',
         updated_at = now()
   where true;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.reset_geoguesser_all_stats() from public;
grant execute on function public.reset_geoguesser_all_stats() to authenticated;
