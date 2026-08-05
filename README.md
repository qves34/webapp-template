# Watchlist

Osobní seznam filmů, anime a seriálů, vázaný na účet - přihlásíš se z libovolného zařízení a máš svá data. Export / Import JSON zůstává jako ruční záloha navrch.

Postavené na React + Vite, nasazuje se na Vercel přes `git push`. Účty a data drží Supabase (Postgres + Auth).

## Co appka umí

- **Účet**: registrace/přihlášení emailem a heslem (Supabase Auth), data patří k účtu a jsou dostupná odkudkoli, ne jen v jednom prohlížeči.
- Přidat titul: napiš název a našeptávač z TMDB nabídne film/seriál s plakátkem a rokem; klik doplní i typ. Jde i napsat ručně bez výběru (funguje i anime, TMDB ho nerozlišuje jako zvlášť typ).
- Stav titulu: **Chci vidět → Dívám se → Dočasně přerušeno → Přerušeno → Dokoukáno**. Klik na štítek stavu ho přepne na další.
- U každého titulu navíc: kde jsi (`S2E5`), hodnocení 1-10 a poznámka. Rozbalíš tlačítkem „Upravit".
- Filtr podle stavu i podle typu (film/anime/seriál), hledání v názvech a poznámkách.
- **Export** stáhne `watchlist-RRRR-MM-DD.json`, **Import** ho načte zpátky - nezávislá ruční záloha vedle cloud sync. Import slučuje: stejný titul (podle `id`) vyhrává ten s novější změnou, nic se nemaže.
- Titulům, co zůstaly v `localStorage` z doby před účty, appka po prvním přihlášení nabídne jednorázové nahrání do účtu.

Rozkoukané tituly jsou vždycky nahoře a hlavička ukazuje, co zrovna koukáš.

## Požadavky

**Node 20.19+ nebo 22.12+.** Vite 8 na starším Node nenaběhne. Ověř si `node -v`.

Pro našeptávač titulů potřebuješ zdarma TMDB API klíč (https://www.themoviedb.org/settings/api). Pro účty a data zdarma Supabase projekt (https://supabase.com):

1. Založ projekt.
2. **Authentication → Providers → Email** - vypni „Confirm email" (osobní appka, ať se po registraci rovnou přihlásíš bez klikání na odkaz v mailu).
3. **SQL Editor** - vlož a spusť obsah `supabase/schema.sql` (vytvoří tabulku `watchlist_items` + RLS politiky, aby každý viděl jen svoje tituly).
4. **Settings → API** - zkopíruj Project URL a `anon` `public` klíč.

Vše dej do `.env` (viz `.env.example`):

```
TMDB_API_KEY=tvůj_klíč
VITE_SUPABASE_URL=https://tvuj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=tvůj_anon_klíč
```

`VITE_`-prefixované proměnné skončí (jako čitelný text) v JS balíčku, co jde do prohlížeče - proto smí být jen `anon`/`public` klíč, nikdy `service_role` klíč (ten by obešel RLS a musí zůstat jen na serveru, kdyby ho appka někdy potřebovala).

## Lokální vývoj

```bash
npm install
npm run dev      # http://localhost:5173 - jen frontend, /api neběží
npm run lint
npm run build
```

`npm run dev` neumí spouštět `api/` funkce (to dělá až Vercel). Pro otestování našeptávače lokálně použij `vercel dev` (potřebuje přihlášení přes `vercel login`) - na produkci `/api/search` funguje automaticky. Přihlašování a data přes Supabase naopak lokálně fungují i s obyčejným `npm run dev` - klient mluví přímo na Supabase cloud, žádný lokální proxy server nepotřebuje.

## Struktura

```
src/
  App.jsx                gating na přihlášení, layout, filtry, export/import, jednorázová migrace z localStorage
  components/            AddForm, AuthForm, Toolbar, ItemRow
  hooks/useAuth.js       session ze Supabase Auth (signUp/signIn/signOut)
  hooks/useWatchlist.js  stav seznamu + čtení/zápis do Supabase (RLS = jen vlastní řádky)
  lib/watchlist.js       datový model, řazení, merge, export/import (beze změny, nezávislé na úložišti)
  lib/watchlistRemote.js mapování položky na/ze sloupců Supabase tabulky
  lib/supabaseClient.js  Supabase klient (singleton)
  index.css              barvy, fonty, reset
  App.css                vzhled komponent
api/search.js            proxy na TMDB search/multi (klíč jen na serveru)
supabase/schema.sql       tabulka + RLS politiky, spustit ručně v Supabase SQL editoru
vercel.json              SPA routing
```

Titulům z doby před účty (localStorage klíč `watchlist.v1`) appka po prvním přihlášení nabídne nahrání do účtu; ať uživatel zvolí cokoli, `localStorage` se nemaže a zůstává jako tichá lokální rezerva.

## Nasazení (GitHub → Vercel)

Jednorázové napojení: https://vercel.com → „Add New Project" → vyber repo → Deploy (preset „Vite" se pozná sám).

Od té chvíle každý `git push` na `main` nasadí novou verzi, ostatní branche dostanou preview URL.

Po přidání `TMDB_API_KEY`, `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` do `.env` je přidej i ve Vercelu (Settings → Environment Variables) a redeploy - jinak `/api/search` vrátí 500 a přihlášení na produkci vůbec nenaběhne.

## Kam dál

- **Realtime sync mezi otevřenými zařízeními** - dnes se data načtou při přihlášení/refreshi, ne živě přes Supabase Realtime (`postgres_changes`). Zatím netřeba, appka řeší jen „data mě následují", ne živé multi-device updaty.
- **Offline zápis** - appka teď vyžaduje spojení pro každou akci (přidání/úprava/smazání jde rovnou na Supabase). Offline fronta by šla dodělat, zatím to pro osobní použití nevadí.
- **Skutečná vlastní doména** - zdarma přejmenovaná `*.vercel.app` adresa (Domains → Add Existing, název s příponou `.vercel.app`) už nastavená; opravdová vlastní TLD doména (mimo `*.vercel.app`) zatím ne.
