-- ATFR — Durcissement des candidatures (P1-3).
--
-- Deux failles corrigées :
--   1. Doublons : rien n'empêchait un même joueur d'envoyer plusieurs
--      candidatures "pending" (spam involontaire via double-clic ou rechargement,
--      ou volontaire).
--   2. Race sur la revue : deux admins pouvaient valider/refuser la même
--      candidature simultanément, le dernier écrasant silencieusement le
--      premier (le garde applicatif correspondant est côté client :
--      useUpdateApplicationStatus vérifie désormais le statut attendu).
--
-- ⚠️ Cette migration modifie des données existantes si des doublons
-- "pending" sont présents : seule la candidature la plus récente de chaque
-- joueur (par discord_tag et par account_id, par clan cible) reste
-- "pending", les autres passent en "archived" avec une note explicative.
-- Sans cela, la création des index uniques échouerait.

-- 1a. Archiver les doublons pending par discord_tag (insensible à la casse).
with ranked as (
  select id,
         row_number() over (
           partition by lower(discord_tag), target_clan
           order by created_at desc
         ) as rn
  from public.applications
  where status = 'pending'
)
update public.applications a
   set status = 'archived',
       review_notes = coalesce(a.review_notes || E'\n', '')
         || 'Doublon archivé automatiquement (migration 0047).',
       reviewed_at = now()
  from ranked r
 where a.id = r.id
   and r.rn > 1;

-- 1b. Même chose par account_id (quand renseigné).
with ranked as (
  select id,
         row_number() over (
           partition by account_id, target_clan
           order by created_at desc
         ) as rn
  from public.applications
  where status = 'pending'
    and account_id is not null
)
update public.applications a
   set status = 'archived',
       review_notes = coalesce(a.review_notes || E'\n', '')
         || 'Doublon archivé automatiquement (migration 0047).',
       reviewed_at = now()
  from ranked r
 where a.id = r.id
   and r.rn > 1;

-- 2. Index uniques partiels : une seule candidature "pending" par joueur et
-- par clan cible. Les candidatures traitées (accepted/rejected/archived) ne
-- bloquent pas une nouvelle candidature.
create unique index if not exists applications_pending_discord_uidx
  on public.applications (lower(discord_tag), target_clan)
  where status = 'pending';

create unique index if not exists applications_pending_account_uidx
  on public.applications (account_id, target_clan)
  where status = 'pending' and account_id is not null;
