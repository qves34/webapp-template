-- Watchlist items, one row per titul, viditelný a zapisovatelný jen svým vlastníkem.
-- Spustit v Supabase → SQL Editor (jednorázově, na nově založeném projektu).

create table public.watchlist_items (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title text not null,
  kind text not null check (kind in ('film', 'anime', 'serial')),
  status text not null check (status in ('chci', 'divam', 'pauza', 'preruseno', 'hotovo')),
  progress text not null default '',
  rating smallint check (rating is null or (rating between 1 and 10)),
  note text not null default '',
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tmdb_id integer,
  year text,
  poster text
);

create index watchlist_items_user_id_idx on public.watchlist_items (user_id);

alter table public.watchlist_items enable row level security;

-- SELECT: uživatel vidí jen svoje řádky.
create policy "select own items"
  on public.watchlist_items for select
  using (auth.uid() = user_id);

-- INSERT: nový řádek smí vzniknout jen s vlastním user_id.
create policy "insert own items"
  on public.watchlist_items for insert
  with check (auth.uid() = user_id);

-- UPDATE: USING hlídá, které řádky smí uživatel vůbec sáhnout,
-- WITH CHECK hlídá výsledný tvar (brání přepsání na cizí user_id).
create policy "update own items"
  on public.watchlist_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: jen vlastní řádky.
create policy "delete own items"
  on public.watchlist_items for delete
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.watchlist_items to authenticated;
