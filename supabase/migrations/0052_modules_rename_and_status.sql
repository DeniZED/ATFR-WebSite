-- ATFR — Renommage « Académie » → « Modules » (contenu home) + statut par
-- module (disponible / nouveau / bientôt).
--
-- Idempotente. Le renommage du CONTENU ne s'applique que si la valeur est
-- encore le défaut d'origine, pour ne jamais écraser une personnalisation
-- faite depuis l'admin. Les libellés (label) sont, eux, toujours mis à jour
-- pour clarifier l'admin.

-- =======================================================================
-- 1. Libellés admin : « Académie home » → « Modules home »
-- =======================================================================
update public.site_content set label = 'Modules home - surtitre'          where key = 'academy_preview_eyebrow';
update public.site_content set label = 'Modules home - titre'             where key = 'academy_preview_title';
update public.site_content set label = 'Modules home - description'       where key = 'academy_preview_text';
update public.site_content set label = 'Modules home - carte titre'       where key = 'academy_preview_card_title';
update public.site_content set label = 'Modules home - carte texte'       where key = 'academy_preview_card_text';
update public.site_content set label = 'Modules home - bouton principal'  where key = 'academy_preview_cta';
update public.site_content set label = 'Modules home - bouton module'     where key = 'academy_preview_module_cta';

-- =======================================================================
-- 2. Contenu : renommage garde-fou (uniquement si valeur = défaut d'origine)
-- =======================================================================
update public.site_content
  set value = 'Modules ATFR'
  where key = 'academy_preview_eyebrow' and value = 'Académie ATFR';

update public.site_content
  set value = 'Les outils du clan'
  where key = 'academy_preview_title' and value = 'Des outils qui rendent le site vivant';

-- =======================================================================
-- 3. Statut par module
-- =======================================================================
alter table public.learning_modules
  add column if not exists status text not null default 'disponible'
    check (status in ('disponible', 'nouveau', 'bientot'));
