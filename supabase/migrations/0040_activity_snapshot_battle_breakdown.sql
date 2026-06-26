-- `battles`/`battles_delta` only ever reflected WoT random battles
-- (statistics.all.battles). Add columns to also track rating battles so
-- the RH module counts members who play mostly ranked/competitive modes.
alter table public.player_activity_snapshots
  add column if not exists random_battles integer,
  add column if not exists rating_battles integer,
  add column if not exists rating_battles_delta integer;

comment on column public.player_activity_snapshots.battles is
  'Total battles (random + rating) at snapshot time.';
comment on column public.player_activity_snapshots.battles_delta is
  'Total battles delta (random + rating) since previous snapshot.';
comment on column public.player_activity_snapshots.random_battles is
  'Random battles count at snapshot time (statistics.all.battles).';
comment on column public.player_activity_snapshots.rating_battles is
  'Rating battles count at snapshot time (statistics.rating.battles).';
comment on column public.player_activity_snapshots.rating_battles_delta is
  'Rating battles delta since previous snapshot.';
