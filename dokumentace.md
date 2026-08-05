# Dokumentace - webapp-template

## Stav (2026-08-05)

Projekt je nasazený a live.

- **Produkce**: https://wwatchlist.vercel.app/
- **Repo**: https://github.com/qves34/webapp-template
- **Deploy**: automaticky přes Vercel při `git push` na `main`

## Co je hotové

- **Watchlist appka**: seznam filmů/anime/seriálů, stavy Chci vidět → Dívám se → Dočasně přerušeno → Přerušeno → Dokoukáno, filtr podle stavu i typu (film/anime/seriál), hledání, Export/Import JSON s merge podle `updatedAt`
- **TMDB našeptávač**: `api/search.js` proxuje `search/multi` na TMDB (klíč `TMDB_API_KEY` jen na serveru), frontend (`AddForm.jsx`) při psaní debounced dotazem nabídne film/seriál s plakátkem a rokem; vybraný titul si nese `tmdbId`/`year`/`poster`, ruční zápis bez výběru pořád funguje (jediná cesta pro anime, TMDB ho zvlášť nerozlišuje)
- **Účty + cloud sync (Supabase)**: `useAuth`/`AuthForm` (email+heslo), `useWatchlist` přepsaný na čtení/zápis do Supabase místo localStorage, RLS politiky (`supabase/schema.sql`) hlídají, že uživatel vidí/mění jen svoje řádky, jednorázová nabídka migrace starých `localStorage` dat po prvním přihlášení. Supabase projekt založený, schéma spuštěné, **end-to-end ověřeno** (viz "Poznámka k testování").
- **5 stavů titulu**: přidány Dočasně přerušeno (zlatý akcent) a Přerušeno (ztlumené) vedle původních tří; DB `CHECK` constraint na sloupci `status` rozšířený, migrace spuštěná přímo na produkční databázi (viz "Poznámka k testování")
- **Vercel deploy**: `vercel.json` s SPA routing pravidlem, framework preset "Vite" rozpoznán automaticky
- **Git**: napojeno na GitHub (`qves34/webapp-template`), `main` nasazen na produkci
- **Lint**: oxlint (`.oxlintrc.json`)
- **README.md**: návod pro lokální vývoj a nasazení (česky)

## Co chybí / další kroky

- Realtime sync mezi otevřenými zařízeními (dnes jen při přihlášení/refreshi) a offline zápis - vědomě mimo scope, appka teď vyžaduje spojení pro každou akci
- Bez routingu (React Router), testů a CI
- Skutečná vlastní doména (mimo `*.vercel.app`) zatím nenastavena - produkce běží na zdarma přejmenované `wwatchlist.vercel.app`

## Poznámka k testování

`npm run dev` (Vite) neumí spustit `api/` funkce - lokální ověření `/api/search` šlo přes malý pomocný Node server mimo repo, co jen zavolal handler napřímo. Supabase naopak lokální proxy nepotřebuje - klient mluví přímo na Supabase cloud.

Vizuální testování přes Playwright/chromium-headless-shell nakonec **šlo rozjet i bez rootu**: chybějící sdílené knihovny (`libnspr4`, `libnss3`, `libasound2t64`) šly stáhnout jako `.deb` přes `apt-get download` (bez instalace) a ručně rozbalit přes `dpkg-deb -x` do lokální složky; s `LD_LIBRARY_PATH` na tuhle složku pak `chromium-headless-shell` naběhl normálně. Tímhle způsobem byl ověřený jak TMDB našeptávač, tak filtr podle typu (film/anime/seriál skutečně zužuje seznam).

Supabase auth + sync ověřeno end-to-end proti reálnému projektu uživatele (`npm run dev` stačí, klient jde přímo na Supabase cloud, `vercel dev` netřeba):
- registrace → rovnou aktivní session (potvrzuje, že "Confirm email" je vypnuté)
- účet A, dvě samostatné prohlížečové session (nový `browser.newContext`) - druhá vidí titul přidaný v první → cross-device sync funguje
- účet B nevidí titul účtu A a naopak, i po refreshi → RLS izolace funguje
- anonymní REST dotaz (anon klíč bez přihlášené session) vrací `[]`, i když v tabulce reálná data jsou → RLS blokuje i neautentizovaný přístup, ne jen cross-user
- smazání titulu (`remove`) ověřeno samostatně, self-cleaning testem (titul po smazání zmizí, žádná data nezůstala)

Jediná zádrhel cestou: `schema.sql` se napoprvé nespustil (tabulka v DB chyběla, REST vracel `PGRST205`) - po doplnění fungovalo vše na první pokus.

## Přímý přístup k databázi

Pro pozdější schema změny (např. rozšíření `CHECK` constraintu u nových stavů) je v lokálním `.env` `SUPABASE_DB_URL` - connection string na Postgres přes **Session pooler** (`aws-1-eu-west-1.pooler.supabase.com:6543`), ne přímé spojení (`db.<ref>.supabase.co:5432`), protože to je jen přes IPv6 a tohle prostředí IPv6 nemá. SQL se pak pouští přes Node balíček `pg` (`npm install pg`, `new pg.Client({connectionString, ssl:{rejectUnauthorized:false}})`), žádný `psql` binárka nebyla potřeba.

`SUPABASE_DB_URL` obsahuje heslo k databázi - zůstává jen v `.env`, nikdy jako `VITE_` proměnná ani ve Vercelu (appka za běhu Postgres přímo nepoužívá, jen Supabase klient přes REST).

## Vercel

Produkční adresa přejmenovaná z `webapp-template-three.vercel.app` na `wwatchlist.vercel.app` (Vercel → Domains → Add Existing s `.vercel.app` příponou, zdarma). `TMDB_API_KEY`, `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` jsou nastavené i ve Vercel Environment Variables - hotovo, produkce běží.
