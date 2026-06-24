-- ATFR - Plafonne la duree des sessions vocales Discord pour absorber les
-- evenements "leave" manques (redemarrage du bot, coupure reseau, etc.).
--
-- Sans plafond, une session laissee ouverte (left_at is null) est cloturee
-- par le PROCHAIN evenement recu pour cet utilisateur, qui peut survenir
-- des heures voire des jours plus tard si le bot a manque l'evenement de
-- depart -> duration_seconds explose (ex: 37h sur une seule session) et
-- fausse les stats RH (heures vocal, nombre de sessions).
--
-- A executer dans le SQL Editor Supabase apres 0022_hr_discord_bot_and_player_settings.sql.
-- Cette migration est idempotente et peut etre relancee.

create or replace function public.record_discord_voice_event(
  p_guild_id text default null,
  p_discord_user_id text default null,
  p_channel_id text default null,
  p_channel_name text default null,
  p_event text default 'join',
  p_occurred_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  linked_player_id uuid;
  event_name text := lower(coalesce(p_event, 'join'));
  event_at timestamptz := coalesce(p_occurred_at, now());
  touched_session_id uuid;
  -- Duree maximale plausible d'une session vocale continue. Au-dela, on
  -- considere que l'evenement "leave" a ete manque et on plafonne plutot
  -- que de compter le temps mort comme du vocal reel.
  max_session_seconds constant integer := 43200; -- 12h
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to record Discord voice events'
      using errcode = '42501';
  end if;

  if nullif(p_discord_user_id, '') is null then
    raise exception 'discord_user_id is required'
      using errcode = '22023';
  end if;

  if event_name not in ('join', 'leave', 'move') then
    raise exception 'Unsupported voice event %', event_name
      using errcode = '22023';
  end if;

  select player_id into linked_player_id
  from public.player_discord_links
  where discord_user_id = p_discord_user_id
    and is_primary = true
  limit 1;

  if event_name in ('join', 'move') and nullif(p_channel_id, '') is null then
    raise exception 'channel_id is required for join and move events'
      using errcode = '22023';
  end if;

  with closed as (
    update public.discord_voice_sessions session
    set left_at = event_at,
        duration_seconds = least(
          max_session_seconds,
          greatest(
            0,
            floor(extract(epoch from (event_at - session.joined_at)))::integer
          )
        ),
        player_id = coalesce(session.player_id, linked_player_id)
    where session.discord_user_id = p_discord_user_id
      and session.left_at is null
      and (p_guild_id is null or session.guild_id = p_guild_id)
    returning session.id
  )
  select id into touched_session_id
  from closed
  limit 1;

  if event_name in ('join', 'move') then
    insert into public.discord_voice_sessions (
      player_id,
      discord_user_id,
      guild_id,
      channel_id,
      channel_name,
      joined_at,
      duration_seconds,
      source
    )
    values (
      linked_player_id,
      p_discord_user_id,
      nullif(p_guild_id, ''),
      nullif(p_channel_id, ''),
      nullif(p_channel_name, ''),
      event_at,
      0,
      'bot'
    )
    returning id into touched_session_id;
  end if;

  if linked_player_id is not null then
    update public.players
    set last_discord_voice_at = event_at,
        updated_at = now()
    where id = linked_player_id
      and (
        last_discord_voice_at is null
        or last_discord_voice_at < event_at
      );
  end if;

  return touched_session_id;
end
$$;

-- Corrige retroactivement les sessions deja enregistrees avec une duree
-- aberrante (ex: 37h sur une seule connexion vocale).
update public.discord_voice_sessions
set duration_seconds = 43200
where duration_seconds > 43200;

grant execute on function public.record_discord_voice_event(text, text, text, text, text, timestamptz)
  to authenticated, service_role;

notify pgrst, 'reload schema';
