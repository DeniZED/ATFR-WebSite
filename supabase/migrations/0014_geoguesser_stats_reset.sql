-- ATFR - GeoGuesseur : reset des statistiques de screenshots.
--
-- A executer dans le SQL Editor Supabase apres 0013_geoguesser_daily_challenge.sql.
-- Les resets remettent les compteurs a zero et repartent en difficulte easy,
-- puis record_shot_attempt(...) reprend l'adaptation automatique.

alter table public.geoguesser_shots
  alter column difficulty set default 'easy';

create or replace function public.reset_geoguesser_shot_stats(
  p_shot_id uuid
) returns integer
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
   where id = p_shot_id;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.reset_geoguesser_map_stats(
  p_map_id text
) returns integer
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
   where map_id = p_map_id;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

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

revoke all on function public.reset_geoguesser_shot_stats(uuid) from public;
revoke all on function public.reset_geoguesser_map_stats(text) from public;
revoke all on function public.reset_geoguesser_all_stats() from public;

grant execute on function public.reset_geoguesser_shot_stats(uuid) to authenticated;
grant execute on function public.reset_geoguesser_map_stats(text) to authenticated;
grant execute on function public.reset_geoguesser_all_stats() to authenticated;
