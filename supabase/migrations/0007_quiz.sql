-- ATFR — Module "Guide pour les bots" : schéma quiz.
--
-- Trois tables principales :
--   quiz_categories : positionnement, focus, awareness, etc.
--   quiz_questions  : situations (titre, image, contexte, question,
--                     explication, statut)
--   quiz_answers    : réponses possibles (2-6 par question, exactement
--                     une marquée is_correct = true)
--
-- Et deux tables d'analytics optionnelles :
--   quiz_sessions        : une partie jouée
--   quiz_session_answers : choix individuels des joueurs (alimente le
--                          taux de réussite par question)

-- =======================================================================
-- categories
-- =======================================================================
create table if not exists public.quiz_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  color       text default '#E8B043',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Quelques catégories pré-seedées : l'éditeur peut renommer / supprimer.
insert into public.quiz_categories (slug, name, sort_order) values
  ('positioning',   'Positionnement',     1),
  ('focus',         'Focus & priorités',  2),
  ('map_awareness', 'Lecture de carte',   3),
  ('survival',      'Survie',             4),
  ('decision',      'Prise de décision',  5)
on conflict (slug) do nothing;

-- =======================================================================
-- questions
-- =======================================================================
create table if not exists public.quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references public.quiz_categories(id) on delete set null,
  difficulty     text not null default 'medium'
                  check (difficulty in ('easy','medium','hard','expert')),
  title          text not null,
  context        text,
  image_url      text,
  question       text not null,
  explanation    text,
  is_published   boolean not null default false,
  is_featured    boolean not null default false,
  sort_order     integer not null default 0,
  success_count  integer not null default 0,
  attempt_count  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users(id) on delete set null
);

create index if not exists quiz_questions_category_idx
  on public.quiz_questions(category_id);
create index if not exists quiz_questions_published_idx
  on public.quiz_questions(is_published) where is_published = true;
create index if not exists quiz_questions_featured_idx
  on public.quiz_questions(is_featured) where is_featured = true;

drop trigger if exists quiz_questions_set_updated_at on public.quiz_questions;
create trigger quiz_questions_set_updated_at
  before update on public.quiz_questions
  for each row execute function public.set_updated_at();

-- =======================================================================
-- answers
-- =======================================================================
create table if not exists public.quiz_answers (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references public.quiz_questions(id) on delete cascade,
  label         text not null,
  is_correct    boolean not null default false,
  sort_order    integer not null default 0
);

create index if not exists quiz_answers_question_idx
  on public.quiz_answers(question_id);

-- Au plus une bonne réponse par question.
drop index if exists quiz_one_correct_per_question;
create unique index quiz_one_correct_per_question
  on public.quiz_answers(question_id)
  where is_correct = true;

-- =======================================================================
-- analytics (optionnel)
-- =======================================================================
create table if not exists public.quiz_sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  mode         text not null check (mode in ('test','training','category')),
  category_id  uuid references public.quiz_categories(id) on delete set null,
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  score        integer,
  total        integer
);

create table if not exists public.quiz_session_answers (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.quiz_sessions(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_id   uuid references public.quiz_answers(id) on delete set null,
  is_correct  boolean not null,
  answered_at timestamptz not null default now()
);

create index if not exists quiz_session_answers_session_idx
  on public.quiz_session_answers(session_id);
create index if not exists quiz_session_answers_question_idx
  on public.quiz_session_answers(question_id);

-- Trigger : mettre à jour les compteurs success/attempt sur quiz_questions
-- à chaque insert dans quiz_session_answers (pour identifier les
-- questions les plus ratées dans l'admin).
create or replace function public.tally_quiz_answer()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.quiz_questions
     set attempt_count = attempt_count + 1,
         success_count = success_count + (case when new.is_correct then 1 else 0 end)
   where id = new.question_id;
  return new;
end;
$$;

drop trigger if exists quiz_session_answers_tally on public.quiz_session_answers;
create trigger quiz_session_answers_tally
  after insert on public.quiz_session_answers
  for each row execute function public.tally_quiz_answer();

-- =======================================================================
-- RLS
-- =======================================================================
alter table public.quiz_categories      enable row level security;
alter table public.quiz_questions       enable row level security;
alter table public.quiz_answers         enable row level security;
alter table public.quiz_sessions        enable row level security;
alter table public.quiz_session_answers enable row level security;

-- Catégories : lecture publique, écriture editor.
drop policy if exists "quiz_categories read"  on public.quiz_categories;
drop policy if exists "quiz_categories write" on public.quiz_categories;
create policy "quiz_categories read"
  on public.quiz_categories for select to anon, authenticated using (true);
create policy "quiz_categories write"
  on public.quiz_categories for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- Questions : lecture publique uniquement si is_published, écriture
-- editor pour tout (lecture admin incluse via is_editor).
drop policy if exists "quiz_questions public read" on public.quiz_questions;
drop policy if exists "quiz_questions admin read"  on public.quiz_questions;
drop policy if exists "quiz_questions write"       on public.quiz_questions;
create policy "quiz_questions public read"
  on public.quiz_questions for select to anon
  using (is_published = true);
create policy "quiz_questions admin read"
  on public.quiz_questions for select to authenticated using (true);
create policy "quiz_questions write"
  on public.quiz_questions for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- Réponses : lecture publique seulement pour les questions publiées.
drop policy if exists "quiz_answers public read" on public.quiz_answers;
drop policy if exists "quiz_answers admin read"  on public.quiz_answers;
drop policy if exists "quiz_answers write"       on public.quiz_answers;
create policy "quiz_answers public read"
  on public.quiz_answers for select to anon
  using (
    exists (
      select 1 from public.quiz_questions q
      where q.id = quiz_answers.question_id and q.is_published = true
    )
  );
create policy "quiz_answers admin read"
  on public.quiz_answers for select to authenticated using (true);
create policy "quiz_answers write"
  on public.quiz_answers for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- Sessions : anon peut créer/finir sa propre session, admin peut tout
-- lire pour stats.
drop policy if exists "quiz_sessions insert anon" on public.quiz_sessions;
drop policy if exists "quiz_sessions read auth"   on public.quiz_sessions;
drop policy if exists "quiz_sessions update self" on public.quiz_sessions;
create policy "quiz_sessions insert anon"
  on public.quiz_sessions for insert to anon, authenticated with check (true);
create policy "quiz_sessions read auth"
  on public.quiz_sessions for select to authenticated using (public.is_editor());
create policy "quiz_sessions update self"
  on public.quiz_sessions for update to anon, authenticated
  using (true) with check (true);

drop policy if exists "quiz_session_answers insert" on public.quiz_session_answers;
drop policy if exists "quiz_session_answers read"   on public.quiz_session_answers;
create policy "quiz_session_answers insert"
  on public.quiz_session_answers for insert to anon, authenticated with check (true);
create policy "quiz_session_answers read"
  on public.quiz_session_answers for select to authenticated using (public.is_editor());
