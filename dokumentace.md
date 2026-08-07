# Dokumentace - webapp-template

## Stav (2026-08-07)

Projekt je nasazený a live.

- **Produkce**: https://wwatchlist.vercel.app/
- **Repo**: https://github.com/qves34/webapp-template
- **Deploy**: automaticky přes Vercel při `git push` na `main`

## Co je hotové

- **Watchlist appka**: seznam filmů/anime/seriálů, stavy Chci vidět → Dívám se → Dočasně přerušeno → Přerušeno → Dokoukáno, filtr podle stavu i typu (film/anime/seriál), hledání
- **Profil** (`ProfilePanel.jsx`): email (jen náhled), změna nicknamu a hesla, krátké bio (`profile_bios`, max 200 znaků, viditelné jen vlastníkovi a přijatým přátelům - RLS "select friends bio" ve stejném stylu jako u watchlistu), přehled oblíbených titulů
- **TMDB našeptávač**: `api/search.js` proxuje `search/multi` na TMDB (klíč `TMDB_API_KEY` jen na serveru), frontend (`AddForm.jsx`) při psaní debounced dotazem nabídne titul s plakátkem a rokem; vybraný titul si nese `tmdbId`/`year`/`poster`. Zvolený typ zužuje i výsledky hledání (`KIND_FILTERS`) - film/seriál podle `media_type`, anime přiblížené přes žánr Animace (16) + `original_language = 'ja'`, protože TMDB kategorii "anime" nemá. Ta aproximace nesedí vždycky, takže ruční zápis bez výběru zůstává záchranou. Názvy se ukládají vždycky anglicky (viz Lokalizace).
- **Účty + cloud sync (Supabase)**: `useAuth`/`AuthForm` (email+heslo), `useWatchlist` přepsaný na čtení/zápis do Supabase místo localStorage, RLS politiky (`supabase/schema.sql`) hlídají, že uživatel vidí/mění jen svoje řádky, jednorázová nabídka migrace starých `localStorage` dat po prvním přihlášení. Supabase projekt založený, schéma spuštěné, **end-to-end ověřeno** (viz "Poznámka k testování").
- **5 stavů titulu**: přidány Dočasně přerušeno (zlatý akcent) a Přerušeno (ztlumené) vedle původních tří; DB `CHECK` constraint na sloupci `status` rozšířený, migrace spuštěná přímo na produkční databázi (viz "Poznámka k testování")
- **Přátelé**: nickname (povinný při prvním přihlášení, `useProfile`/`NicknameGate`, case-insensitive unikátní v `profiles`), hledání podle nicku, žádost o přátelství s potvrzením (`friendships`, stavy `pending`/`accepted`), po přijetí vidíš watchlist přítele read-only (`useFriendWatchlist`, nová RLS policy "select friends items" na `watchlist_items`). Odmítnutí/zrušení/odebrání z přátel = smazání řádku, žádný zvláštní stav "declined". `FriendsPanel.jsx` řeší vyhledávání i správu žádostí/přátel, přepínání mezi "Moje" a "Přátelé" je v `App.jsx` (`view` state), badge u tlačítka Přátelé ukazuje počet čekajících žádostí.
- **Doporučení přátel ("Možná znáš")**: DB funkce `recommend_friends(p_limit)` (`SECURITY DEFINER`, `supabase/schema.sql`) spočítá pro přihlášeného uživatele překryv s každým ostatním - shoda titulu podle `tmdb_id`, u manuálních záznamů bez něj podle normalizovaného názvu. Skóre = počet shodných titulů + 2× počet shodných oblíbených, zobrazí se od 3 shodných titulů výš, vyloučení lidí, se kterými už žádost/přátelství existuje. Ven jde jen agregát (nickname + počty), nikdy konkrétní názvy z cizího seznamu - funkce běží s vyššími právy (obchází RLS interně), ale `EXECUTE` je omezené jen na `authenticated` (explicitně odebráno `anon`, které Supabase defaultně přidává novým funkcím). Počítá se při načtení Friends panelu, ne živě - stejné omezení jako zbytek přátel (viz "Co chybí").
- **Lokalizace CS/EN (2026-08-07)**: celé UI přes slovníky v `src/lib/i18n/` (126 klíčů), přepínač `CS`/`EN` vedle přepínače motivu. Napoprvé se jazyk vybere podle `navigator.languages`, pak se drží v `localStorage` (`watchlist.locale`). Plurály řeší `Intl.PluralRules` (čeština 1 / 2-4 / 5+), řazení podle abecedy `Intl.Collator` s aktuálním jazykem. **Názvy titulů se nepřekládají** - `api/search.js` se ptá TMDB vždycky s `language=en-US` (rozhodnutí uživatele 2026-08-07: anglický název je univerzálnější a hlavně na TMDB vždycky existuje, kdežto český u anime a méně známých seriálů často chybí; navíc je jednoznačný, takže hledání v seznamu má co hledat). Chybové hlášky ze Supabase se do UI nepouštějí - jsou natvrdo anglicky, takže se `error.code` mapuje na vlastní klíč (`lib/authErrors.js`, `useProfile`, `useFriends`); neznámý kód spadne na obecnou hlášku a skutečný důvod jde do konzole. Identifikátory typů/stavů zůstávají nepřeložené (jsou to hodnoty v DB), popisky drží slovník - `lib/watchlist.js` proto nese jen holá pole `KINDS`/`STATUSES`/`SORT_MODES` bez labelů.
- **Kontrola slovníků**: `npm run check:i18n` (`scripts/check-i18n.mjs`) hlídá paritu klíčů mezi jazyky, plurálové tvary, shodné zástupné symboly a nepřeložené texty. Bez testovacího frameworku - `lib/i18n/core.js` je čistý JS bez Reactu, takže ho Node načte přímo. První permanentní kontrola v projektu.
- **Vercel deploy**: `vercel.json` s SPA routing pravidlem, framework preset "Vite" rozpoznán automaticky
- **Git**: napojeno na GitHub (`qves34/webapp-template`), `main` nasazen na produkci
- **Lint**: oxlint (`.oxlintrc.json`)
- **README.md**: návod pro lokální vývoj a nasazení (česky)

## Co chybí / další kroky

- Realtime sync mezi otevřenými zařízeními (dnes jen při přihlášení/refreshi) a offline zápis - vědomě mimo scope, appka teď vyžaduje spojení pro každou akci
- Bez routingu (React Router) a CI. Testy jen `npm run check:i18n` (slovníky), zbytek appky testy nemá.
- Lokalizace: `index.html` má natvrdo `lang="cs"` a českou `<meta name="description">` - provider je po načtení přepíše, ale náhledy sdíleného odkazu JS nespouštějí, takže popisek zůstane vždycky český (šlo by až prerenderem, vědomě neřešeno)
- Skutečná vlastní doména (mimo `*.vercel.app`) zatím nenastavena - produkce běží na zdarma přejmenované `wwatchlist.vercel.app`
- Přátelé: notifikace o nové žádosti se projeví jen po refreshi/přepnutí na "Přátelé" (žádný realtime/badge push), nickname jde nastavit jen jednou při onboardingu (změna později by šla přidat, dnes UI pro to není)

## Bugfix: race condition v `useWatchlist` (2026-08-06)

Počáteční `select` z `watchlist_items` po přihlášení mohl dorazit AŽ po tom, co uživatel mezitím titul přidal (optimistický zápis do `itemsRef`) - `.then` callback dřívějšího dotazu pak tvrdě přepsal `itemsRef`/`items` starým (prázdným) stavem ze serveru a tiše smazal čerstvě přidaný titul z UI (do DB titul reálně zapsaný zůstal, jen zmizel z obrazovky, dokud se stránka znovu nenačetla). Objeveno při e2e testu funkce přátel (rychlý automatizovaný klik hned po načtení stránky race spolehlivě trefil, ruční používání je pomalejší, takže šlo dřív přehlédnout).

Oprava: initial load teď dělá `mergeItems(itemsRef.current, loaded)` místo přímého přepsání - stejná funkce, co už appka používala pro Export/Import merge.

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

**Přátelé** ověřeno end-to-end přes Playwright (chromium-headless-shell, stejný `apt-get download` + `dpkg-deb -x` trik na `libnspr4`/`libnss3`/`libasound2t64` jako u předchozích testů) proti produkční databázi, 2 skutečné testovací účty (Supabase Auth signup, "Confirm email" vypnuté):
- registrace → NicknameGate → nastavení nicku (unikátnost vynucená DB indexem, appka na `23505` hlásí "Tenhle nickname už je zabraný")
- účet B najde účet A podle nicku, pošle žádost, účet A ji uvidí v "Přátelé" a přijme
- účet B po přijetí vidí watchlist účtu A read-only (RLS "select friends items" funguje) - ověřeno i že se needitovatelné položce nezobrazí tlačítko "Upravit"
- self-cleaning: zrušení přátelství (delete řádku `friendships`) a smazání testovacího titulu po testu
- testovací `auth.users` účty (email `@example.com`) smazané přímo přes `SUPABASE_DB_URL`/`pg` (cascade smazal i navázané `profiles`/`watchlist_items`/`friendships`) - Admin API/service_role klíč nebyl potřeba, stačilo přímé DB spojení popsané níže

Cestou odhalen a opravený race condition v `useWatchlist` (viz "Bugfix" výše) - bez zpoždění mezi načtením stránky a přidáním titulu se ztrácel čerstvě přidaný titul z UI.

**Doporučení přátel** ověřeno stejným způsobem, 2 testovací účty se 3 shodnými manuálně zapsanými tituly (bez `tmdb_id`, takže shoda přes normalizovaný název) + 1 shodný oblíbený:
- účet B vidí účet A v "Možná znáš" s textem "3 společných titulů (1 oblíbených)" - počty přesně sedí s daty. (Ten text byl gramaticky špatně - správně je "3 společné tituly (1 oblíbený)". Skládal se tehdy natvrdo bez ohledu na číslo; lokalizace 2026-08-07 to opravila přes `Intl.PluralRules`.)
- po odeslání žádosti z doporučení účet A z "Možná znáš" zmizí (vyloučení podle existující `friendships` funguje)
- doporučení se počítají při načtení Friends panelu (`useFriends`), ne živě - po přidání titulu je potřeba reload, než se v doporučení projeví (konzistentní s tím, že appka obecně nemá realtime)
- self-cleaning: zrušení přátelství + smazání testovacích titulů po testu, testovací účty smazané stejně jako u předchozích testů

**Zjištění a dodatečný úklid mimo scope tohoto testu**: v produkční DB bylo objeveno ~15 starých testovacích `auth.users` účtů (`test-a-*`, `test-status-*`, `test-sort-*`, `test-kindsearch-*`, `test-hated-*`, `test-theme-*`, `test-favorite-*@yopmail.com` aj.) z předchozích testovacích session, které tehdy nebyly uklizené. Po potvrzení uživatelem smazané (`delete from auth.users where email like 'test-%@yopmail.com'`, cascade smazal i navázaná `watchlist_items`/`profiles`). V DB zůstaly 3 skutečné účty: `t34ar001@gmail.com` (hlavní účet, 12 položek), `2222@gmail.com` a `dedsakldsa@gmail.com` (uživatel potvrdil - jeho a kamarádův). Dřívější tvrzení v konverzaci, že "35 zbylých watchlist_items" po dřívějším úklidu byla uživatelova reálná data, bylo nesprávné - ve skutečnosti šlo o součet napříč všemi těmito starými testovacími účty; teď opraveno a DB odpovídá jen reálným účtům.

**Lokalizace CS/EN** ověřena bez přihlášení - Supabase účet k tomu není potřeba:
- `npm run check:i18n` - 12 kontrol slovníků. Ověřeno i to, že kontrola opravdu chytá chyby: do `en.js` byly dočasně vneseny čtyři vady (chybějící klíč, chybějící plurálový tvar, nepřeložený text, přejmenovaná proměnná) a každou nahlásila právě jedna kontrola; slovník pak vrácen do původního stavu.
- Vizuálně přes headless Chrome (v tomhle prostředí Windows Chrome z WSL přes `/mnt/c/...`, `--headless=new --screenshot`). Přihlašovací obrazovka česky i anglicky; jazyk vybraný podle prohlížeče ověřen přes `--lang=en-US` (bez uložené volby appka správně naběhla anglicky).
- Vnitřní obrazovky jsou za přihlášením, takže byly vykresleny přes dočasný demo vstup (`__demo.html` + `src/__demo.jsx`) s falešnými daty - `Toolbar`, `ItemRow`, `FriendsPanel`, hlavička, hlášky a patička v obou jazycích. Ověřeny hlavně plurály na reálném layoutu ("1 společný titul (1 oblíbený)" / "3 společné tituly (2 oblíbené)" / "7 společných titulů" a jejich anglické protějšky) a to, že delší české texty layout nerozbíjejí. Demo soubory po ověření smazané, v repu nejsou.

**Prostředí**: lokálně běžel Node 18, na kterém Vite 8 ani oxlint nenaběhnou (`npm run build` padal na `styleText` z `node:util`, oxlint na chybějícím nativním binárku). Doinstalován Node 22 LTS přes nvm (`~/.nvm`, `nvm alias default 22`) a `node_modules` přeinstalovány přes `npm ci` - tím se doplnil i chybějící `@oxlint/binding-linux-x64-gnu`. Systémový `/usr/bin/node` zůstal nedotčený. Požadavek Node 20.19+/22.12+ byl v README popsaný správně už předtím, jen lokální prostředí bylo pozadu.

## Přímý přístup k databázi

> **Pozor (2026-08-07): lokální `.env` v pracovní kopii chybí** - je tam jen `.env.example`. Popis níž platí, ale connection string i klíče je potřeba nejdřív znovu doplnit (`.env` je v `.gitignore`, takže v repu nikdy nebyl a z jiného stroje se nepřenese). Kvůli tomu se lokálně nedá spustit ani přihlášení, ani nic proti produkční DB.

Pro pozdější schema změny (např. rozšíření `CHECK` constraintu u nových stavů) patří do lokálního `.env` `SUPABASE_DB_URL` - connection string na Postgres přes **Session pooler** (`aws-1-eu-west-1.pooler.supabase.com:6543`), ne přímé spojení (`db.<ref>.supabase.co:5432`), protože to je jen přes IPv6 a tohle prostředí IPv6 nemá. SQL se pak pouští přes Node balíček `pg` (`npm install pg`, `new pg.Client({connectionString, ssl:{rejectUnauthorized:false}})`), žádný `psql` binárka nebyla potřeba.

`SUPABASE_DB_URL` obsahuje heslo k databázi - zůstává jen v `.env`, nikdy jako `VITE_` proměnná ani ve Vercelu (appka za běhu Postgres přímo nepoužívá, jen Supabase klient přes REST).

## Vercel

Produkční adresa přejmenovaná z `webapp-template-three.vercel.app` na `wwatchlist.vercel.app` (Vercel → Domains → Add Existing s `.vercel.app` příponou, zdarma). `TMDB_API_KEY`, `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` jsou nastavené i ve Vercel Environment Variables - hotovo, produkce běží.
