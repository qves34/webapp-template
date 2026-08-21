# Watchlist

Osobní seznam filmů, anime a seriálů, vázaný na účet - přihlásíš se z libovolného zařízení a máš svá data.

Postavené na React + Vite, nasazuje se na Vercel přes `git push`. Účty a data drží Supabase (Postgres + Auth).

## Co appka umí

- **Účet**: registrace/přihlášení emailem a heslem (Supabase Auth), data patří k účtu a jsou dostupná odkudkoli, ne jen v jednom prohlížeči.
- Přidat titul: napiš název a našeptávač z TMDB nabídne tituly s plakátkem a rokem podle zvoleného typu (Film/Anime/Seriál) - tlačítko typu zúží i výsledky hledání, ne jen to, co se přidá. TMDB nemá "anime" jako vlastní kategorii, takže se přiblíží přes žánr Animace + japonský originál (nemusí sedět úplně vždy, ruční zápis bez výběru pořád funguje).
- Stav titulu: **Chci vidět → Dívám se → Dočasně přerušeno → Přerušeno → Dokoukáno**. Klik na štítek stavu ho přepne na další.
- U každého titulu navíc: kde jsi (`S2E5`), hodnocení 1-10, poznámka a zaškrtávátko **HATED** (viditelný červený štítek u titulu). Rozbalíš tlačítkem „Upravit".
- **Oblíbené**: hvězdička přímo na řádku, přepíná se jedním klikem bez otevření Upravit.
- Filtr podle stavu i podle typu (film/anime/seriál), hledání v názvech a poznámkách, řazení (stav/abecedně/hodnocení).
- Titulům, co zůstaly v `localStorage` z doby před účty, appka po prvním přihlášení nabídne jednorázové nahrání do účtu.
- **Přátelé**: při prvním přihlášení si zvolíš nickname (3-20 znaků, unikátní). V sekci „Přátelé" podle nicku najdeš ostatní, pošleš žádost o přátelství - druhá strana ji musí přijmout. Po přijetí vidíš watchlist přítele (read-only, bez úprav). Odebrání z přátel/odmítnutí/zrušení žádosti jde jedním tlačítkem.
- **Profil**: email (jen náhled), změna nicknamu a hesla, krátké bio (max 200 znaků) a přehled oblíbených titulů. Bio vidí jen tví přijatí přátelé, ne kdokoli přihlášený.
- **Možná znáš**: appka sama navrhne lidi s podobným vkusem - podle shodných titulů v seznamu (a ještě víc podle shodných oblíbených) doporučí uživatele, se kterými se dost překrýváš, aniž bys musel znát jejich nickname.
- **Čeština a angličtina**: tlačítko `CS`/`EN` vpravo nahoře přepne jazyk celého UI. Napoprvé se jazyk vybere podle prohlížeče (`navigator.languages`), volba se pak pamatuje per prohlížeč. Přepíná se i řazení podle abecedy (čeština řadí Č/Ř/Š jinak než angličtina). **Názvy titulů se nepřekládají** - drží se anglicky v obou jazycích UI, viz sekce Jazyky.

Rozkoukané tituly jsou vždycky nahoře a hlavička ukazuje, co zrovna koukáš.

**Vzhled**: tlačítko „Vzhled" vpravo nahoře (vedle `CS`/`EN`) otevře kartu se vším kolem vzhledu pohromadě - světlý/tmavý motiv, automatické přepínání podle času (20:00-6:00 tmavý), barva tématu (oranžová/modrá/zelená/fialová) a postranní bannery. Motiv/barva/auto režim se pamatují per prohlížeč (jinak podle systému), stejně jako dřív.

**Postranní bannery**: na širokém desktopu (od ~1400px šířky okna) appka po stranách zobrazí dekorativní banner. V kartě Vzhled má sekce „Postranní bannery" 3 záložky: **Barevné** (vzor laděný podle zvolené barvy tématu), **Trendující** (pár aktuálně nejoblíbenějších titulů - film/seriál přes TMDB trending, anime přes AniList, viz `api/banners.js`) a **Vlastní** (plakát z tvého vlastního seznamu - u titulu s TMDB záznamem klikni na „Nastavit jako banner" a appka nabídne dostupné plakáty z TMDB, viz `api/posters.js`; jde nastavit stejný na obě strany, nebo každou stranu zvlášť jiným plakátem stejného titulu). Vlastní banner jde až ke krajům obrazovky a je širší než ostatní styly. Na rozdíl od motivu/jazyka jde volba přes účet (`profiles.banner_style`/`banner_image_left`/`banner_image_right`), takže se drží napříč zařízeními. Na užších oknech a mobilu se automaticky skrývá.

## Požadavky

**Node 20.19+ nebo 22.12+.** Vite 8 na starším Node nenaběhne. Ověř si `node -v`.

Pro našeptávač titulů potřebuješ zdarma TMDB API klíč (https://www.themoviedb.org/settings/api). Pro účty a data zdarma Supabase projekt (https://supabase.com):

1. Založ projekt.
2. **Authentication → Providers → Email** - vypni „Confirm email" (osobní appka, ať se po registraci rovnou přihlásíš bez klikání na odkaz v mailu).
3. **SQL Editor** - vlož a spusť obsah `supabase/schema.sql` (vytvoří tabulky `watchlist_items`, `profiles`, `friendships`, `profile_bios` + RLS politiky - vlastní tituly a bio vidí jen majitel, přátelé s přijatou žádostí navíc read-only cizí watchlist i bio, nickname v `profiles` je na rozdíl od bia hledatelný komukoli přihlášenému - a funkci `recommend_friends` pro doporučení podle shodných titulů).
4. **Settings → API** - zkopíruj Project URL a `anon` `public` klíč.

Vše dej do `.env` (viz `.env.example`):

```
TMDB_API_KEY=tvůj_klíč
VITE_SUPABASE_URL=https://tvuj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=tvůj_anon_klíč
```

`VITE_`-prefixované proměnné skončí (jako čitelný text) v JS balíčku, co jde do prohlížeče - proto smí být jen `anon`/`public` klíč, nikdy `service_role` klíč (ten by obešel RLS a musí zůstat jen na serveru, kdyby ho appka někdy potřebovala).

`.env.example` zná ještě nepovinné `SUPABASE_DB_URL` - to appka k běhu nepotřebuje, je jen pro ruční změny schématu z příkazové řádky (viz `dokumentace.md`).

## Lokální vývoj

```bash
npm install
npm run dev         # http://localhost:5173 - jen frontend, /api neběží
npm run lint
npm run check:i18n  # kontrola slovníků (parita klíčů, plurály, proměnné)
npm run build
```

`npm run dev` neumí spouštět `api/` funkce (to dělá až Vercel). Pro otestování našeptávače lokálně použij `vercel dev` (potřebuje přihlášení přes `vercel login`) - na produkci `/api/search` funguje automaticky. Přihlašování a data přes Supabase naopak lokálně fungují i s obyčejným `npm run dev` - klient mluví přímo na Supabase cloud, žádný lokální proxy server nepotřebuje.

## Struktura

```
src/
  main.jsx                   vstupní bod, obaluje appku do <I18nProvider>
  App.jsx                    gating na přihlášení a nickname, layout, filtry, migrace z localStorage, přepínání Moje/Přátelé/Profil
  components/                AddForm, AuthForm, Toolbar, ItemRow, NicknameGate, FriendsPanel, ProfilePanel
  hooks/useAuth.js           session ze Supabase Auth (signUp/signIn/signOut)
  hooks/useTheme.js          světlý/tmavý motiv, uložený per prohlížeč (jinak podle systému)
  hooks/useProfile.js        vlastní nickname a bio (načtení, nastavení, kontrola unikátnosti nicku)
  hooks/useWatchlist.js      stav seznamu + čtení/zápis do Supabase (RLS = jen vlastní řádky)
  hooks/useFriends.js        žádosti o přátelství, seznam přátel, hledání podle nicku, doporučení (recommend_friends)
  hooks/useFriendWatchlist.js read-only watchlist konkrétního přítele
  hooks/useFriendProfile.js  read-only bio konkrétního přítele
  lib/i18n/cs.js, en.js      slovníky (klíč → text, u počitatelných textů plurálové tvary)
  lib/i18n/core.js           překladová funkce, plurály, interpolace, výběr jazyka - čistý JS bez Reactu
  lib/i18n/context.js        React kontext + hook `useI18n()`, přes který si komponenty berou `t()`
  lib/i18n/index.jsx         `<I18nProvider>` - drží zvolený jazyk, ukládá ho a nastavuje `<html lang>`
  lib/authErrors.js          mapování chybových kódů Supabase Auth na klíče do slovníku
  lib/watchlist.js           datový model, řazení, merge (beze změny, nezávislé na úložišti)
  lib/watchlistRemote.js     mapování položky na/ze sloupců Supabase tabulky
  lib/profile.js             validace formátu nicku a délky bia
  lib/friends.js             mapování friendships řádku vůči přihlášenému uživateli
  lib/supabaseClient.js      Supabase klient (singleton)
  index.css                  barvy, fonty, reset
  App.css                    vzhled komponent
api/search.js                proxy na TMDB search/multi (klíč jen na serveru), názvy vždy `en-US`
api/banners.js                pár trendujících titulů pro banner "Trendující" (TMDB trending + AniList), cachované na edge
api/posters.js                dostupné plakáty ke konkrétnímu titulu z TMDB, pro banner "Vlastní"
api/hello.js                 pozůstatek ze šablony, appka ho nepoužívá - na produkci ale běží jako `/api/hello`
scripts/check-i18n.mjs       kontrola slovníků, pouští se přes `npm run check:i18n`
supabase/schema.sql           tabulky + RLS politiky, spustit ručně v Supabase SQL editoru
vercel.json                  SPA routing
```

Titulům z doby před účty (localStorage klíč `watchlist.v1`) appka po prvním přihlášení nabídne nahrání do účtu; ať uživatel zvolí cokoli, `localStorage` se nemaže a zůstává jako tichá lokální rezerva.

## Jazyky

V UI nejsou žádné natvrdo psané texty - komponenta si vezme `const { t } = useI18n()` a píše `t('klic')`, případně `t('klic', { count: 3 })`.

Ve slovníku je hodnota buď text, nebo objekt s plurálovými tvary. Který tvar se použije, rozhoduje `Intl.PluralRules` podle `count` - plurály se tedy nepočítají ručně a každý jazyk dostane ty tvary, které opravdu má (čeština 1 / 2-4 / 5+, angličtina 1 / ostatní):

```js
'migration.prompt': {
  one: 'Našli jsme {count} titul uložený v tomhle prohlížeči. Nahrát ho do účtu?',
  few: 'Našli jsme {count} tituly uložené v tomhle prohlížeči. Nahrát je do účtu?',
  other: 'Našli jsme {count} titulů uložených v tomhle prohlížeči. Nahrát je do účtu?',
},
```

Přidání dalšího jazyka:

1. Zkopíruj `src/lib/i18n/cs.js` do `xx.js` a přelož hodnoty (klíče nech být).
2. V `src/lib/i18n/core.js` přidej jazyk do `LOCALES` (`htmlLang` jde do `<html lang>`, `short` na přepínač, `name` je název jazyka v něm samotném) a do `DICTS`.
3. `npm run check:i18n` - ohlásí chybějící klíče, chybějící plurálové tvary i texty, co zůstaly nepřeložené.

Přepínač jazyků prochází `LOCALES` dokola, takže se o nový jazyk nemusí starat.

Identifikátory typů a stavů (`film`, `divam`, …) jsou zároveň hodnoty v databázi - **nepřekládají se**, překládají se až přes klíče `kind.<id>`, `status.<id>` a `sort.<id>`. Proto `lib/watchlist.js` drží jen holá pole identifikátorů a žádné popisky.

### Názvy titulů zůstávají anglicky

Vědomé rozhodnutí: `api/search.js` se ptá TMDB vždycky s `language=en-US`, takže se uloží anglický název bez ohledu na to, v jakém jazyce appku zrovna používáš.

Důvod: anglický název existuje vždycky, kdežto český na TMDB u spousty anime a méně známých seriálů chybí - polovina seznamu by pak stejně zůstala anglicky a vypadalo by to jako rozbitá funkce. Anglický název je navíc jednoznačný (jeden titul = jedno jméno), takže hledání v seznamu má co hledat a stejný titul se nepřidá dvakrát pod dvěma jmény.

Jazyk UI to neovlivňuje - dotaz se na TMDB matchuje i proti přeloženým názvům, takže „Duna" najde *Dune*. Ruční zápis bez výběru z našeptávače si samozřejmě uloží přesně to, co napíšeš.

Známé omezení: `index.html` má natvrdo `lang="cs"` a českou `<meta name="description">`. Provider obojí po načtení přepíše podle zvoleného jazyka, ale náhledy sdíleného odkazu (Slack, Facebook) JS nespouštějí, takže popisek uvidí vždycky česky. Opravit by to šlo až prerenderem, což by kvůli jedné větě byla velká cena.

## Nasazení (GitHub → Vercel)

Jednorázové napojení: https://vercel.com → „Add New Project" → vyber repo → Deploy (preset „Vite" se pozná sám).

Od té chvíle každý `git push` na `main` nasadí novou verzi, ostatní branche dostanou preview URL.

Po přidání `TMDB_API_KEY`, `VITE_SUPABASE_URL` a `VITE_SUPABASE_ANON_KEY` do `.env` je přidej i ve Vercelu (Settings → Environment Variables) a redeploy - jinak `/api/search` vrátí 500 a přihlášení na produkci vůbec nenaběhne.

## Kam dál

- **Realtime sync mezi otevřenými zařízeními** - dnes se data načtou při přihlášení/refreshi, ne živě přes Supabase Realtime (`postgres_changes`). Zatím netřeba, appka řeší jen „data mě následují", ne živé multi-device updaty.
- **Offline zápis** - appka teď vyžaduje spojení pro každou akci (přidání/úprava/smazání jde rovnou na Supabase). Offline fronta by šla dodělat, zatím to pro osobní použití nevadí.
- **Skutečná vlastní doména** - zdarma přejmenovaná `*.vercel.app` adresa (Domains → Add Existing, název s příponou `.vercel.app`) už nastavená; opravdová vlastní TLD doména (mimo `*.vercel.app`) zatím ne.
- **Banner „Trendující" - živý žebříček, ne kurátorský výběr** - appka bere aktuálně trendující/populární tituly (TMDB `/trending`, AniList `TRENDING_DESC`), ne ručně sestavený seznam „nejslavnějších" - jednodušší na údržbu, ale obsah se v čase mění a nejde ho ručně kurátorovat. Šlo by nahradit pevným seznamem tmdbId/AniList id, kdyby bylo žádoucí mít stálou sadu.
