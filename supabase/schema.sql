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
  hated boolean not null default false,
  favorite boolean not null default false,
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

-- Jeden řádek na uživatele, nickname je jediná věc potřebná pro hledání
-- přátel. Viditelné/hledatelné všem přihlášeným (žádné citlivé údaje).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  constraint nickname_format check (nickname ~ '^[a-zA-Z0-9_]{3,20}$')
);

-- Case-insensitive unikátnost ("Franta" a "franta" je kolize).
create unique index profiles_nickname_unique_idx on public.profiles (lower(nickname));

alter table public.profiles enable row level security;

-- Nickname musí jít dohledat komukoli přihlášenému, jinak nejde hledat přátele.
create policy "select all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

-- Žádost o přátelství jako jedna hrana requester -> addressee. Přijetí =
-- update status na 'accepted'. Odmítnutí/zrušení/odebrání z přátel = delete
-- řádku (žádný samostatný stav "declined" - appka to řeší na úrovni UI).
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  addressee_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint no_self_friend check (requester_id <> addressee_id),
  constraint unique_pair unique (requester_id, addressee_id)
);

create index friendships_addressee_idx on public.friendships (addressee_id);
create index friendships_requester_idx on public.friendships (requester_id);

alter table public.friendships enable row level security;

create policy "select own friendships"
  on public.friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "insert own request"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

-- Přijmutí (addressee mění status) i případná budoucí úprava kteroukoli
-- stranou - obě strany jsou v tom řádku "své".
create policy "update own friendships"
  on public.friendships for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "delete own friendships"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

grant select, insert, update, delete on public.friendships to authenticated;

-- Přátelé s accepted friendship smí číst (ne měnit) i cizí položky.
-- Kombinuje se s "select own items" výše (permissive policies pro stejný
-- příkaz se v Postgresu OR-ují).
create policy "select friends items"
  on public.watchlist_items for select
  using (
    exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = watchlist_items.user_id)
          or (f.addressee_id = auth.uid() and f.requester_id = watchlist_items.user_id)
        )
    )
  );
