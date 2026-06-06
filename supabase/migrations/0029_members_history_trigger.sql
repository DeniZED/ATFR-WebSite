-- =======================================================================
-- Trigger: auto-populate members_history on members INSERT/UPDATE
-- Handles: joined, left, re_joined (as 'joined'), role_changed
-- =======================================================================

create or replace function public.track_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    -- Skip initial inserts that arrive already departed (left_at set on insert)
    if NEW.left_at is null then
      insert into public.members_history(account_id, account_name, action, new_role)
      values (NEW.account_id, NEW.account_name, 'joined', NEW.role);
    end if;
    return NEW;
  end if;

  if TG_OP = 'UPDATE' then
    -- Re-join: left_at went from a value back to NULL (takes priority)
    if OLD.left_at is not null and NEW.left_at is null then
      insert into public.members_history(account_id, account_name, action, new_role)
      values (NEW.account_id, NEW.account_name, 'joined', NEW.role);
    -- Departure: left_at went from NULL to a value
    elsif OLD.left_at is null and NEW.left_at is not null then
      insert into public.members_history(account_id, account_name, action, previous_role)
      values (NEW.account_id, NEW.account_name, 'left', OLD.role);
    -- Role changed while still active (no departure/re-join)
    elsif OLD.role is distinct from NEW.role
      and OLD.left_at is null
      and NEW.left_at is null then
      insert into public.members_history(account_id, account_name, action, previous_role, new_role)
      values (NEW.account_id, NEW.account_name, 'role_changed', OLD.role, NEW.role);
    end if;
    return NEW;
  end if;

  return null;
end;
$$;

drop trigger if exists members_track_change on public.members;
create trigger members_track_change
  after insert or update on public.members
  for each row execute function public.track_member_change();
