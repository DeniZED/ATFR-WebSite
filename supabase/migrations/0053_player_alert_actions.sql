-- Phase 6 — Workflow d'alertes (overlay d'état).
--
-- Les alertes RH sont calculées à la volée (src/features/rh/activity.ts,
-- computeAlerts) et ne sont PAS persistées. Plutôt que de matérialiser les
-- alertes, on persiste uniquement l'ÉTAT DE TRAITEMENT décidé par le staff,
-- indexé par (player_id, kind). Une ligne n'existe que lorsqu'un officier a
-- pris une action ; l'absence de ligne = alerte « à traiter » (open).
--
-- Additif : aucune table existante n'est modifiée ni supprimée.

create table if not exists public.player_alert_actions (
  id            uuid primary key default gen_random_uuid(),
  player_id     uuid not null references public.players(id) on delete cascade,
  -- Même nomenclature que player_alerts.kind / StaffAlert.kind.
  kind          text not null
    check (kind in (
      'inactive',
      'no_discord',
      'no_wot',
      'game_no_voice',
      'voice_no_clan',
      'activity_drop',
      'watch',
      'custom'
    )),
  status        text not null default 'open'
    check (status in ('open', 'in_progress', 'snoozed', 'ignored', 'resolved')),
  assigned_to   uuid references auth.users(id) on delete set null,
  -- Masque l'alerte jusqu'à cette échéance (status = 'snoozed').
  snooze_until  timestamptz,
  resolution_note text,
  updated_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Une seule décision de traitement par (joueur, type d'alerte).
  unique (player_id, kind)
);

create index if not exists player_alert_actions_player_idx
  on public.player_alert_actions(player_id);
create index if not exists player_alert_actions_status_idx
  on public.player_alert_actions(status);
create index if not exists player_alert_actions_assigned_idx
  on public.player_alert_actions(assigned_to)
  where assigned_to is not null;

drop trigger if exists player_alert_actions_set_updated_at
  on public.player_alert_actions;
create trigger player_alert_actions_set_updated_at
  before update on public.player_alert_actions
  for each row execute function public.set_updated_at();

alter table public.player_alert_actions enable row level security;

-- Même périmètre RBAC que le reste du module RH (cf. 0033_module_access_rls).
drop policy if exists "auth can manage player alert actions"
  on public.player_alert_actions;
create policy "auth can manage player alert actions"
  on public.player_alert_actions for all
  to authenticated
  using (public.is_admin() or public.has_module('rh'))
  with check (public.is_admin() or public.has_module('rh'));
