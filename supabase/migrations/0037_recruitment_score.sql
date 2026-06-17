-- ATFR — Score de recrutement (WN8 via tomato.gg) + historique léger des
-- statuts de mouvement.
--
-- A executer apres 0036_clan_movement_recruitment.sql. Idempotente.
--
-- Ajouts :
--   recruitment_settings — réglages (en base de données) des seuils/poids
--     utilisés à la fois par l'onglet Mouvements (filtre WN8/batailles min),
--     le calcul du score de recrutement et les embeds Discord. Une seule
--     ligne (singleton), configurable depuis Admin > Paramètres.
--   clan_member_movements.status_history — petit historique des statuts de
--     suivi recrutement (new/contacted/linked/ignored), alimenté
--     automatiquement par trigger à chaque insertion/changement de statut.

create table if not exists public.recruitment_settings (
  id boolean primary key default true,
  constraint recruitment_settings_singleton check (id),
  min_wn8 integer not null default 0
    check (min_wn8 >= 0),
  min_battles integer not null default 0
    check (min_battles >= 0),
  weight_wn8 numeric not null default 40
    check (weight_wn8 >= 0),
  weight_winrate numeric not null default 20
    check (weight_winrate >= 0),
  weight_battles numeric not null default 15
    check (weight_battles >= 0),
  weight_tier10 numeric not null default 25
    check (weight_tier10 >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

insert into public.recruitment_settings (id)
values (true)
on conflict (id) do nothing;

drop trigger if exists recruitment_settings_set_updated_at
  on public.recruitment_settings;
create trigger recruitment_settings_set_updated_at
  before update on public.recruitment_settings
  for each row execute function public.set_updated_at();

alter table public.recruitment_settings enable row level security;

drop policy if exists "admin can manage recruitment settings"
  on public.recruitment_settings;
create policy "admin can manage recruitment settings"
  on public.recruitment_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ── Historique léger des statuts sur clan_member_movements ─────────────────

alter table public.clan_member_movements
  add column if not exists status_history jsonb not null default '[]'::jsonb;

create or replace function public.record_movement_status_history()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.status_history := jsonb_build_array(
      jsonb_build_object('status', new.contact_status, 'changed_at', now(), 'changed_by', auth.uid())
    );
    return new;
  end if;

  if new.contact_status is distinct from old.contact_status then
    new.status_history := coalesce(old.status_history, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object('status', new.contact_status, 'changed_at', now(), 'changed_by', auth.uid())
    );
  end if;
  return new;
end
$$;

drop trigger if exists clan_member_movements_status_history
  on public.clan_member_movements;
create trigger clan_member_movements_status_history
  before insert or update on public.clan_member_movements
  for each row execute function public.record_movement_status_history();

notify pgrst, 'reload schema';
