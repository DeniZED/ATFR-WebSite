-- =======================================================================
-- Patch import_members_to_players: clear clan data for departed members
-- Players who were synced before but absent from the new roster get
-- current_clan_tag = NULL so infer_player_hr_status() returns 'former'.
-- =======================================================================

create or replace function public.import_members_to_players(
  p_clan_tag text default null,
  p_clan_id bigint default null,
  p_members jsonb default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_count integer := 0;
  payload jsonb := '[]'::jsonb;
  has_payload boolean := false;
begin
  if not public.is_admin() then
    raise exception 'Admin role required to import members into players'
      using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_members, '[]'::jsonb)) = 'array' then
    payload := coalesce(p_members, '[]'::jsonb);
  end if;
  has_payload := jsonb_array_length(payload) > 0;

  -- Sync members table if payload provided
  if has_payload then
    insert into public.members as existing_member (
      account_id,
      account_name,
      role,
      joined_at,
      left_at,
      updated_at
    )
    select distinct on (incoming.account_id)
      incoming.account_id,
      incoming.account_name,
      coalesce(nullif(incoming.role, ''), 'member'),
      case
        when incoming.joined_at is null or incoming.joined_at <= 0
          then now()
        else to_timestamp(incoming.joined_at)
      end,
      null,
      now()
    from jsonb_to_recordset(payload) as incoming(
      account_id bigint,
      account_name text,
      role text,
      joined_at double precision
    )
    where incoming.account_id is not null
      and nullif(incoming.account_name, '') is not null
    order by incoming.account_id
    on conflict (account_id) do update
      set account_name = excluded.account_name,
          role = excluded.role,
          joined_at = coalesce(existing_member.joined_at, excluded.joined_at),
          left_at = null,
          updated_at = now();
  end if;

  with source_members as (
    select distinct on (candidate.account_id)
      candidate.account_id,
      candidate.account_name,
      candidate.role,
      candidate.joined_at
    from (
      select
        incoming.account_id,
        incoming.account_name,
        nullif(incoming.role, '') as role,
        case
          when incoming.joined_at is null or incoming.joined_at <= 0
            then now()
          else to_timestamp(incoming.joined_at)
        end as joined_at
      from jsonb_to_recordset(
        case when has_payload then payload else '[]'::jsonb end
      ) as incoming(
        account_id bigint,
        account_name text,
        role text,
        joined_at double precision
      )
      where incoming.account_id is not null
        and nullif(incoming.account_name, '') is not null

      union all

      select
        m.account_id,
        m.account_name,
        m.role,
        m.joined_at
      from public.members m
      where not has_payload
        and m.left_at is null
    ) as candidate
    order by candidate.account_id
  )
  insert into public.players as existing (
    account_id,
    nickname,
    current_clan_tag,
    current_clan_id,
    internal_role,
    joined_at,
    status,
    source,
    last_wot_activity_at,
    updated_by
  )
  select
    source_members.account_id,
    source_members.account_name,
    nullif(p_clan_tag, ''),
    p_clan_id,
    source_members.role,
    source_members.joined_at,
    'watch',
    'member_sync',
    null,
    auth.uid()
  from source_members
  on conflict (account_id) do update
    set nickname = excluded.nickname,
        current_clan_tag = excluded.current_clan_tag,
        current_clan_id = excluded.current_clan_id,
        internal_role = excluded.internal_role,
        joined_at = coalesce(existing.joined_at, excluded.joined_at),
        status = case
          when existing.status in ('former', 'prospect')
            or existing.source = 'member_sync'
            then excluded.status
          else existing.status
        end,
        source = excluded.source,
        updated_by = excluded.updated_by,
        updated_at = now();

  get diagnostics affected_count = row_count;

  -- Mark departed members: previously synced from this clan, now absent from roster.
  -- Clearing current_clan_tag causes infer_player_hr_status() to return 'former'.
  if has_payload and nullif(p_clan_tag, '') is not null then
    update public.players
    set current_clan_tag = null,
        current_clan_id = null,
        updated_at = now()
    where source = 'member_sync'
      and current_clan_tag = p_clan_tag
      and account_id is not null
      and account_id not in (
        select (m->>'account_id')::bigint
        from jsonb_array_elements(payload) as m
        where (m->>'account_id') is not null
      );
  end if;

  perform public.recompute_player_hr_statuses();
  return affected_count;
end
$$;

grant execute on function public.import_members_to_players(text, bigint, jsonb)
  to authenticated;
