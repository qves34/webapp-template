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
- **Lokalizace CS/EN (2026-08-07)**: celé UI přes slovníky v `src/lib/i18n/` (132 klíčů, počet průběžně roste/klesá s novými funkcemi), přepínač `CS`/`EN` vedle přepínače motivu. Napoprvé se jazyk vybere podle `navigator.languages`, pak se drží v `localStorage` (`watchlist.locale`). Plurály řeší `Intl.PluralRules` (čeština 1 / 2-4 / 5+), řazení podle abecedy `Intl.Collator` s aktuálním jazykem. **Názvy titulů se nepřekládají** - `api/search.js` se ptá TMDB vždycky s `language=en-US` (rozhodnutí uživatele 2026-08-07: anglický název je univerzálnější a hlavně na TMDB vždycky existuje, kdežto český u anime a méně známých seriálů často chybí; navíc je jednoznačný, takže hledání v seznamu má co hledat). Chybové hlášky ze Supabase se do UI nepouštějí - jsou natvrdo anglicky, takže se `error.code` mapuje na vlastní klíč (`lib/authErrors.js`, `useProfile`, `useFriends`); neznámý kód spadne na obecnou hlášku a skutečný důvod jde do konzole. Identifikátory typů/stavů zůstávají nepřeložené (jsou to hodnoty v DB), popisky drží slovník - `lib/watchlist.js` proto nese jen holá pole `KINDS`/`STATUSES`/`SORT_MODES` bez labelů.
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
- Přátelé: notifikace o nové žádosti se projeví jen po refreshi/přepnutí na "Přátelé" (žádný realtime/badge push)
- Email jde na Profilu jen zobrazit, appka nemá UI na jeho změnu - Supabase to řeší přes potvrzovací email na starou i novou adresu, což by přineslo víc UI stavů a chybových hlášek navíc; při zavedení Profilu (2026-08-07) vědomě odloženo, uživatel zvolil jen nickname + heslo

## Bugfix: race condition v `useWatchlist` (2026-08-06)

Počáteční `select` z `watchlist_items` po přihlášení mohl dorazit AŽ po tom, co uživatel mezitím titul přidal (optimistický zápis do `itemsRef`) - `.then` callback dřívějšího dotazu pak tvrdě přepsal `itemsRef`/`items` starým (prázdným) stavem ze serveru a tiše smazal čerstvě přidaný titul z UI (do DB titul reálně zapsaný zůstal, jen zmizel z obrazovky, dokud se stránka znovu nenačetla). Objeveno při e2e testu funkce přátel (rychlý automatizovaný klik hned po načtení stránky race spolehlivě trefil, ruční používání je pomalejší, takže šlo dřív přehlédnout).

Oprava: initial load teď dělá `mergeItems(itemsRef.current, loaded)` místo přímého přepsání - stejná funkce appka tehdy používala i pro merge při Export/Import (od 2026-08-07 zrušeném, viz níž), dnes ji sdílí jen s migrací starých `localStorage` dat.

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

Pro schema změny (nové tabulky/politiky, rozšíření `CHECK` constraintu) i jednorázové ruční zásahy do dat patří do lokálního `.env` `SUPABASE_DB_URL` - connection string na Postgres přes **Session pooler** (`aws-1-eu-west-1.pooler.supabase.com:6543`), ne přímé spojení (`db.<ref>.supabase.co:5432`), protože to je jen přes IPv6 a tohle prostředí IPv6 nemá. SQL se pouští přes Node balíček `pg` (`npm install --no-save pg`, `new pg.Client({connectionString, ssl:{rejectUnauthorized:false}})`, po použití `npm uninstall pg` - `psql` binárka v prostředí není). Schema změny jdou přes `begin`/`commit` transakci, ať jde v případě chyby udělat `rollback`.

`SUPABASE_DB_URL` obsahuje heslo k databázi - zůstává jen v `.env`, nikdy jako `VITE_` proměnná ani ve Vercelu (appka za běhu Postgres přímo nepoužívá, jen Supabase klient přes REST).

Takhle byla 2026-08-07 přímo na produkční DB spuštěná i migrace `profile_bios` (nová tabulka pro bio, viz "Co je hotové" → Profil) a na žádost uživatele smazané watchlist položky dvou účtů (nickname `Woolin_58` a `flerryx`, jen `watchlist_items` řádky přes `delete ... where user_id in (select id from profiles where nickname in (...))` - účty i `friendships` zůstaly nedotčené).

## Vercel

Produkční adresa přejmenovaná z `webapp-template-three.vercel.app` na `wwatchlist.vercel.app` (Vercel → Domains → Add Existing s `.vercel.app` příponou, zdarma). `TMDB_API_KEY`, `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` jsou nastavené i ve Vercel Environment Variables - hotovo, produkce běží.

Zaznamenaný incident (2026-08-07): dva pushe na `main` za sebou dostaly na GitHubu status `Vercel: failure` s hláškou "GitHub couldn't verify an account for the commit" a produkce zůstala na starší verzi, přestože commit (stejný autor/email jako předtím fungující pushe) byl v pořádku a lokální lint/build prošly. Vyřešeno ověřením emailu commit autora v GitHub účtu (Settings → Emails) - po ověření další push (i prázdný `--allow-empty` na vyvolání nového pokusu) prošel normálně. Stav jde ověřit přes `gh api repos/<owner>/<repo>/commits/<sha>/status`.

## Bugfix: prohozené watchlisty mezi přáteli (2026-08-07)

Po zavedení RLS politiky "select friends items" (přátelé smí číst cizí `watchlist_items`, viz sekce Přátelé) přestal fungovat dotaz na **vlastní** seznam v `useWatchlist.js`: `supabase.from('watchlist_items').select('*')` bez `.eq('user_id', userId)` se dřív spoléhal na to, že RLS vrátí jen vlastní řádky. Jenže dvě permissive politiky pro stejný příkaz (SELECT) se v Postgresu OR-ují, takže bezfiltrový dotaz začal vracet sjednocení vlastních řádků a řádků všech přátel - uživatel pak v "mém" seznamu viděl i tituly kamaráda a naopak. Zápisy (`insert`/`update`/`delete`) měly `user_id` filtr celou dobu, takže žádná data v DB nebyla poškozená ani přepsaná, šlo čistě o špatné čtení. Oprava: doplněný `.eq('user_id', userId)` do dotazu.

Cestou přidané drobnosti: klik na nápis "Watchlist" v hlavičce teď ze všech pohledů (Moje/Přátelé/watchlist přítele/Profil) vrátí na hlavní seznam.

## Zrušen ruční Export/Import JSON (2026-08-07)

Appka měla od začátku (ještě z localStorage éry) tlačítka Export/Import jako ruční zálohu vedle cloud sync. Po zavedení účtů se stala z velké části zbytečnou - data jsou v Supabase, dostupná z libovolného zařízení, takže manuální stahování/nahrávání JSON souboru přestalo dávat smysl jako běžný workflow. Odstraněno na žádost uživatele: tlačítka v hlavičce, `handleExport`/`handleImport` v `App.jsx`, `downloadExport`/`readExport`/`buildExport`/`ImportError`/`EXPORT_VERSION` v `lib/watchlist.js`, odpovídající i18n klíče. `mergeItems` zůstala - používá ji i jednorázová migrace starých `localStorage` dat po prvním přihlášení.

## Barevná schémata, hromadné akce, Markdown poznámky, mobil a postranní bannery (2026-08-21)

Rozdělaná práce (barevná schémata oranžová/modrá/zelená/fialová, auto režim podle času, hromadný výběr+dávkové akce, přesun titulu nahoru/dolů, Markdown v poznámce) byla dokončena a dořešeny bugy, co v ní zůstaly: batch ovládání nebylo napojené na `Toolbar` (crash na kliknutí), `moveItem` počítal posun podle jiného pořadí, než se zobrazuje, chyběly i18n klíče a CSS pro nové prvky a `MarkdownRenderer` (`lib/markdown.js`) neescapoval HTML - poznámku vidí i přijatí přátelé (read-only watchlist), šlo tedy o stored XSS. Opraveno escapováním + whitelistem `http(s)/mailto` u odkazů.

Dále na žádost uživatele:
- Oprava poskakování toolbaru mezi CS/EN (`.toolbar__controls` teď má `flex-basis: 100%` - vlastní řádek pod taby vždycky, ne podle toho, jestli se delší české popisky vejdou vedle nich) a srovnání ovládacích prvků (hromadný výběr/řazení/hledání) do jednoho řádku místo sloupce.
- Smazána patička s textem "Data jsou u tvého účtu..." + tally stavů pod seznamem (duplicita s toolbar taby).
- Oprava mobilu: `.controls` (dřív fixní roh) se na `max-width: 640px` přepíná na `position: static` - jinak by se překrývala s tlačítky v hlavičce (nezbylo tam dost místa).

**Postranní bannery**: nová dekorativní `position: fixed` lišta po obou stranách `.app` (od `min-width: 1400px`, jinak `display: none`), `pointer-events: none` + `aria-hidden` (čistě dekorativní). Buď vzor laděný podle barvy tématu (`--tape`/`--gold`/`--done`, stejné proměnné jako zbytek UI), nebo sloupec plakátků z vlastního seznamu (`item.poster`, oblíbené a rozkoukané tituly první). Nová sloupec `profiles.banner_style` (`off`/`pattern`/`posters`, migrace spuštěná přímo na produkční DB stejným postupem jako dřív - `pg` přes `SUPABASE_DB_URL`, `begin`/`commit`, pak `npm uninstall pg`) - na rozdíl od motivu/jazyka jde volba přes účet, drží se napříč zařízeními.

**Panel Vzhled**: na žádost uživatele nahrazeny 3 samostatné ikonky (motiv/auto/barva) jedním tlačítkem "Vzhled" vedle přepínače jazyka, po kliku otevře kartu se vším pohromadě (`AppearancePanel.jsx`) - motiv (světlý/tmavý segmentovaně, ne cyklickým tlačítkem), auto režim (checkbox), barva tématu (segmentovaně, 4 možnosti) a bannery. `useTheme.js` proto místo `toggleTheme`/`cycleColorScheme` teď vrací přímé settery `setLightDark`/`setColorScheme`. `useProfile()` (dřív volané až v `Gate`) se teď volá v `App` - tlačítko Vzhled sedí mimo `Gate` (vedle jazyka, dostupné i před přihlášením kvůli motivu), takže potřebuje přístup k `bannerStyle` shora; `Gate` dostává `profile` jako prop místo vlastního volání hooku. Sekce bannerů se v panelu zobrazí, jen když `session` existuje a `nickname` je nastavený (dřív by update na neexistující řádek v `profiles` tiše selhal).

Bannery mají 2 záložky: **Barevné** (hotovo, používá barvu tématu zvolenou výše) a **Z filmů** - zatím jen placeholder na žádost uživatele (výběr tabu nemění `bannerStyle`, jen přepíná zobrazený text). Prozkoumáno jako budoucí zdroj obrázků: TMDB `backdrop_path` (`/trending`, `/top_rated`) pro Film/Seriál (appka na TMDB už napojená), AniList GraphQL `Media.bannerImage` pro Anime (veřejné, bez klíče, bannery přímo k tomu určené) - viz README "Kam dál". Zvážený i fanart.tv, zamítnutý kvůli nutnosti vlastního klíče a omezením pro 3rd-party use, když TMDB+AniList stačí na všechny tři typy bez nové závislosti.

## Bannery "Z filmů" implementované, oprava přetékající barvy tématu (2026-08-21)

Po zpětné vazbě z prvního nasazení: v kartě Vzhled přetékala poslední barva ("Fialová") mimo panel - segmentovaný výběr se 4 ikona+text tlačítky byl širší než 280px panel. Nahrazeno kompaktními kolečky barev (`.color-swatches`/`.color-swatch`, 28px kruh, pevná reprezentativní barva per schéma přes `--swatch-color`, ne živá CSS proměnná - jinak by u zvolené barvy nešlo poznat, jak vypadají ostatní), s `aria-label`/`title` pro přístupnost místo viditelného textu.

Záložka "Z filmů" byla nahlášená jako "nefunguje" - přepnutí tabu jen měnilo náhledový text, aniž by cokoliv měnilo na skutečném banneru. Na žádost uživatele implementováno doopravdy (podle dřívějšího doporučení TMDB+AniList z README):

- **`api/banners.js`** (nová serverless funkce) - `TMDB_API_KEY` (stejný, co appka už používá na `api/search.js`, žádný nový klíč) na `/trending/all/week` → `backdrop_path` u filmů/seriálů; AniList GraphQL (`https://graphql.anilist.co`, veřejné, bez klíče) `Page(media(sort: TRENDING_DESC, type: ANIME))` → `bannerImage` u anime. Výsledky poskládané střídavě (film/seriál, anime, film/seriál, anime...), ať banner není jednostranný. `Cache-Control: s-maxage=21600` (6 h) - trendující žebříček se nemění rychle, netřeba volat TMDB/AniList při každém načtení stránky každého uživatele.
- **`useFamousBanners.js`** - načte `/api/banners` líně (jen když je banner "Z filmů" zapnutý) a drží modulovou cache, ať se při přepínání panelu Vzhled tam a zpátky nevolá znovu.
- **`SideBanners.jsx`** přepsaný - dřív "posters" znamenalo plakátky z vlastního seznamu (favorite/watching), teď `bannerStyle` hodnota `'famous'` znamená trendující tituly z `/api/banners`. Obrázky jsou širokoúhlé (backdrop/banner formát), ne svislé plakáty - `.side-banner__poster` `aspect-ratio` změněný z `2/3` na `16/9`. DB constraint (`profiles.banner_style_values`) přejmenovaný `posters` → `famous` přímo na produkční DB (`update` existujících řádků + `drop`/`add constraint`, stejný `pg`/`SUPABASE_DB_URL` postup).
- V panelu Vzhled teď přepnutí na záložku "Z filmů" (když jsou bannery zapnuté) rovnou nastaví `bannerStyle` na `'famous'`, ne jen náhledový text.

README aktualizované - odstavec o zdrojích v "Kam dál" nahrazený poznámkou, že jde o **živý trendující žebříček**, ne ručně sestavený seznam "nejslavnějších" titulů (jednodušší na údržbu, ale obsah se v čase mění).

## Bannery "Vlastní" - jeden konkrétní plakát z vlastního seznamu (2026-08-21)

Uživatel po vyzkoušení upřesnil, co původně bannerem "Z filmů" myslel: ne kolonku několika drobných obrázků, ale jeden velký svislý "hero" banner ke konkrétnímu titulu z vlastního seznamu (referenční obrázky - alternativní key-art plakáty jako u Jokera). Zjišťoval jsem, odkud takové plakáty vzít:

- Fanouškovské kurátorské weby specializované přesně na tenhle styl (ThePosterDB, MediaUX) appka použít nemůže - **ThePosterDB má v Terms of Service výslovně zakázané scrapování** ("scrape the Services... by any means other than our published interfaces"), takže by šlo o porušení podmínek.
- Legitimní cesta: TMDB `/movie/{id}/images` (a `/tv/{id}/images`) endpoint vrací **všechny plakáty** k danému titulu, ne jen ten jeden ze search - appka na TMDB už napojená, žádný nový klíč. U slavných titulů bývá slušný výběr alternativních verzí, u obskurnějších míň.

Implementace:
- **`api/posters.js`** (nová serverless funkce) - `GET ?tmdbId=X&kind=Y` vrátí až 12 plakátů (`w500`, seřazené podle `vote_average`) přes `include_image_language=en,null` (textless/anglické varianty, ne cizojazyčné s cizími titulky). "Anime" v appce není vázané na konkrétní TMDB media_type (aproximace přes žánr běží nad `movie` i `tv`, viz `api/search.js`), takže se u něj zkusí `tv` a když nic nevrátí, `movie`. Cache 24 h.
- **`useTitlePosters.js`** - načte plakáty k danému `tmdbId`, jen když je picker otevřený.
- **`PosterPicker.jsx`** - mřížka náhledů, klik uloží vybraný.
- **`ItemRow.jsx`** - v rozbaleném "Upravit" nové tlačítko "Nastavit jako banner" (jen u titulů s `tmdbId`, tedy ne u ručně zapsaných) otevře `PosterPicker`.
- **`profiles.banner_image_url`** (nový sloupec, migrace na produkční DB) - vyplněný jen u `banner_style = 'custom'`. `useProfile.js` má `setCustomBanner(url)`, co uloží obojí najednou atomicky.
- **`SideBanners.jsx`** - `style === 'custom'` vykreslí jeden velký obrázek přes celou výšku bannneru na obou stranách (ne stack malých náhledů jako u "Trendující").
- **Panel Vzhled**: 3. záložka "Vlastní" - když je nastavený banner, ukáže malý náhled + text, jinak vyzve otevřít titul v seznamu. Tab jen přepne zpátky na `'custom'`, pokud je banner zapnutý; samotné nastavení obrázku jde jen přes `ItemRow`, protože `AppearancePanel` sedí mimo `Gate`/`Watchlist` a nemá přístup k `items` (bylo by potřeba i `useWatchlist` zvednout na úroveň `App`, což pro jeden picker nestálo za tu složitost).

Přejmenování kvůli srozumitelnosti: dřívější tab "Z filmů" (trendující kolonka) → "Trendující", nový tab "Vlastní" je teď to, co uživatel původně myslel pod "Z filmů".
