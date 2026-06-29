-- ATFR — Type de campagne CW + créneau horaire des soirées.
--
-- Un seul type pour l'instant ('campagne_char_manoeuvres'), la contrainte
-- check sera élargie quand d'autres types de CW seront supportés.
-- Le créneau horaire (slot_start_time/slot_end_time) est défini une fois
-- par campagne et appliqué à toutes les soirées générées automatiquement
-- entre starts_at et ends_at (génération côté application, pas de colonne
-- générée en base).

alter table public.cw_events
  add column if not exists type text not null default 'campagne_char_manoeuvres'
    check (type in ('campagne_char_manoeuvres')),
  add column if not exists slot_start_time time not null default '21:00',
  add column if not exists slot_end_time time not null default '23:00';

notify pgrst, 'reload schema';
