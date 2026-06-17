-- ATFR — Suivi recrutement sur les mouvements de clan + réduction du bruit
-- Discord (notifier uniquement les sorties).
--
-- A executer apres 0035_clan_tracker.sql. Idempotente.
--
-- Ajouts :
--   clan_member_movements.contact_status / linked_player_id : permet au
--     staff de suivre qui a été contacté/transformé en prospect RH
--     directement depuis l'onglet "Mouvements" (Admin > Staff > RH).
--   discord_bot_guild_configs.notify_leaves_only : quand actif, le bot ne
--     poste plus les entrées de clan dans Discord (toujours journalisées en
--     base), seulement les sorties — pour réduire le bruit avec 100+ clans
--     suivis.

alter table public.clan_member_movements
  add column if not exists contact_status text not null default 'new'
    check (contact_status in ('new', 'contacted', 'linked', 'ignored')),
  add column if not exists linked_player_id uuid references public.players(id) on delete set null;

create index if not exists clan_member_movements_contact_status_idx
  on public.clan_member_movements (contact_status);

drop policy if exists "admin can update clan member movements"
  on public.clan_member_movements;
create policy "admin can update clan member movements"
  on public.clan_member_movements for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.discord_bot_guild_configs
  add column if not exists notify_leaves_only boolean not null default false;

create or replace function public.upsert_discord_bot_guild_config(
  p_guild_id text,
  p_clan_notify_channel_id text default null,
  p_tracked_clans jsonb default null,
  p_scan_interval_minutes integer default null,
  p_updated_by text default null,
  p_notify_leaves_only boolean default null
)
returns public.discord_bot_guild_configs
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.discord_bot_guild_configs;
begin
  if not public.is_admin_or_service() then
    raise exception 'Admin role required to update Discord bot guild config'
      using errcode = '42501';
  end if;

  if nullif(p_guild_id, '') is null then
    raise exception 'guild_id is required' using errcode = '22023';
  end if;

  if p_tracked_clans is not null and jsonb_typeof(p_tracked_clans) <> 'array' then
    raise exception 'tracked_clans must be a JSON array' using errcode = '22023';
  end if;

  insert into public.discord_bot_guild_configs as existing (
    guild_id,
    clan_notify_channel_id,
    tracked_clans,
    scan_interval_minutes,
    updated_by,
    notify_leaves_only
  )
  values (
    p_guild_id,
    p_clan_notify_channel_id,
    coalesce(p_tracked_clans, '[]'::jsonb),
    coalesce(p_scan_interval_minutes, 15),
    p_updated_by,
    coalesce(p_notify_leaves_only, false)
  )
  on conflict (guild_id) do update
    set clan_notify_channel_id = coalesce(p_clan_notify_channel_id, existing.clan_notify_channel_id),
        tracked_clans = coalesce(p_tracked_clans, existing.tracked_clans),
        scan_interval_minutes = coalesce(p_scan_interval_minutes, existing.scan_interval_minutes),
        updated_by = coalesce(p_updated_by, existing.updated_by),
        notify_leaves_only = coalesce(p_notify_leaves_only, existing.notify_leaves_only)
  returning * into result;

  return result;
end
$$;

grant execute on function public.upsert_discord_bot_guild_config(text, text, jsonb, integer, text, boolean)
  to authenticated, service_role;

notify pgrst, 'reload schema';
