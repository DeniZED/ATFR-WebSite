-- ATFR — GeoGuesser : dimensions réelles des maps + stats par screenshot
-- pour permettre l'adaptation automatique de la difficulté.
--
--  * wot_maps.size_m            : côté de la map en mètres (les maps WoT
--                                 sont carrées). Standard = 1000 m, certaines
--                                 maps spéciales font 600 m ou 1400 m.
--  * geoguesser_shots.correct_map_count : combien de fois la bonne map a
--                                 été choisie sur ce shot.
--  * record_shot_attempt(...)   : RPC appelée à chaque manche par le
--                                 client public — incrémente les
--                                 compteurs et réajuste la difficulté
--                                 toutes les 10 tentatives.

alter table public.wot_maps
  add column if not exists size_m integer not null default 1000
    check (size_m between 100 and 5000);

alter table public.geoguesser_shots
  add column if not exists correct_map_count integer not null default 0;

-- Tous les nouveaux screens partent en "easy" — la RPC ci-dessous ajustera
-- la difficulté toutes les 10 manches selon le taux de réussite.
alter table public.geoguesser_shots
  alter column difficulty set default 'easy';

create or replace function public.record_shot_attempt(
  p_shot_id          uuid,
  p_correct_map      boolean,
  p_round_score      integer,
  p_max_round_score  integer
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  new_attempts integer;
  new_sum      bigint;
  rate         numeric;
  next_diff    text;
begin
  update public.geoguesser_shots
     set attempt_count     = attempt_count + 1,
         correct_map_count = correct_map_count
                              + case when p_correct_map then 1 else 0 end,
         success_score_sum = success_score_sum + greatest(p_round_score, 0)
   where id = p_shot_id
   returning attempt_count, success_score_sum
        into new_attempts, new_sum;

  if not found then
    return;
  end if;

  -- Réévaluation tous les 10 essais, avec un échantillon minimum de 10.
  if new_attempts >= 10
     and new_attempts % 10 = 0
     and p_max_round_score > 0
  then
    rate := new_sum::numeric
            / (new_attempts::numeric * p_max_round_score::numeric);
    if rate >= 0.80 then
      next_diff := 'expert';
    elsif rate >= 0.60 then
      next_diff := 'hard';
    elsif rate >= 0.40 then
      next_diff := 'medium';
    else
      next_diff := 'easy';
    end if;

    update public.geoguesser_shots
       set difficulty = next_diff
     where id = p_shot_id
       and difficulty <> next_diff;
  end if;
end;
$$;

revoke all on function public.record_shot_attempt(uuid, boolean, integer, integer)
  from public;
grant execute on function public.record_shot_attempt(uuid, boolean, integer, integer)
  to anon, authenticated;
