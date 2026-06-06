-- =======================================================================
-- Trigger: auto-populate members_history on members INSERT/UPDATE/DELETE
-- =======================================================================

create or replace function public.track_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- New member joined
  if TG_OP = 'INSERT' then
    insert into public.members_history(account_id, account_name, action, new_role)
    values (NEW.account_id, NEW.account_name, 'joined', NEW.role);
    return NEW;
  end if;

  -- Member update
  if TG_OP = 'UPDATE' then
    -- Member left (left_at went from NULL to a value)
    if OLD.left_at is null and NEW.left_at is not null then
      insert into public.members_history(account_id, account_name, action, previous_role)
      values (NEW.account_id, NEW.account_name, 'left', OLD.role);
    -- Role changed (and not a departure)
    elsif OLD.role is distinct from NEW.role and NEW.left_at is null then
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
