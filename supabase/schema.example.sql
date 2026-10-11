-- =====================================================================
-- Maths Allophones · Niveau 3 — tables et dossier des voix du professeur
-- À lancer UNE FOIS dans Supabase : SQL Editor → New query → coller → Run.
-- Remplacer ton.adresse@exemple.fr par l’adresse e-mail du compte professeur.
-- Ne touche pas aux tables des niveaux 1 et 2 (fls_…, fls2_…, fls-voix, fls2-voix).
-- =====================================================================
create table if not exists public.fls3_clips (
  id uuid primary key default gen_random_uuid(),
  cle text not null,
  texte text not null,
  chemin text not null,
  duree real default 0,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists fls3_clips_cle on public.fls3_clips (cle);

create table if not exists public.fls3_textes (
  id uuid primary key default gen_random_uuid(),
  evenement text not null,
  texte text not null,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.fls3_clips enable row level security;
alter table public.fls3_textes enable row level security;

-- Tout le monde peut écouter (lecture) ; seul le professeur peut écrire.
drop policy if exists "fls3_clips lecture" on public.fls3_clips;
create policy "fls3_clips lecture" on public.fls3_clips for select using (true);
drop policy if exists "fls3_clips professeur" on public.fls3_clips;
create policy "fls3_clips professeur" on public.fls3_clips for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr')
  with check ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');

drop policy if exists "fls3_textes lecture" on public.fls3_textes;
create policy "fls3_textes lecture" on public.fls3_textes for select using (true);
drop policy if exists "fls3_textes professeur" on public.fls3_textes;
create policy "fls3_textes professeur" on public.fls3_textes for all to authenticated
  using ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr')
  with check ((auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');

-- Dossier public des sons du niveau 3
insert into storage.buckets (id, name, public) values ('fls3-voix', 'fls3-voix', true)
  on conflict (id) do update set public = true;

drop policy if exists "fls3-voix lecture" on storage.objects;
create policy "fls3-voix lecture" on storage.objects for select using (bucket_id = 'fls3-voix');
drop policy if exists "fls3-voix ajout" on storage.objects;
create policy "fls3-voix ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'fls3-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
drop policy if exists "fls3-voix modification" on storage.objects;
create policy "fls3-voix modification" on storage.objects for update to authenticated
  using (bucket_id = 'fls3-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
drop policy if exists "fls3-voix suppression" on storage.objects;
create policy "fls3-voix suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'fls3-voix' and (auth.jwt() ->> 'email') = 'ton.adresse@exemple.fr');
