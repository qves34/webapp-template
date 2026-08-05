# Watchlist

Osobní seznam filmů, anime a seriálů. Tituly si zapisuješ ručně, data zůstávají v prohlížeči (localStorage) a přenášíš je přes Export / Import JSON.

Postavené na React + Vite, nasazuje se na Vercel přes `git push`.

## Co appka umí

- Přidat titul: název + typ (film / anime / seriál).
- Stav titulu: **Chci vidět → Dívám se → Dokoukáno**. Klik na štítek stavu ho přepne na další.
- U každého titulu navíc: kde jsi (`S2E5`), hodnocení 1-10 a poznámka. Rozbalíš tlačítkem „Upravit".
- Filtr podle stavu, hledání v názvech a poznámkách.
- **Export** stáhne `watchlist-RRRR-MM-DD.json`, **Import** ho načte zpátky. Import slučuje: stejný titul (podle `id`) vyhrává ten s novější změnou, nic se nemaže.

Rozkoukané tituly jsou vždycky nahoře a hlavička ukazuje, co zrovna koukáš.

## Požadavky

**Node 20.19+ nebo 22.12+.** Vite 8 na starším Node nenaběhne. Ověř si `node -v`.

## Lokální vývoj

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
```

## Struktura

```
src/
  App.jsx                layout, filtry, export/import
  components/            AddForm, Toolbar, ItemRow
  hooks/useWatchlist.js  stav seznamu + zápis do localStorage
  lib/watchlist.js       datový model, řazení, merge, export/import
  index.css              barvy, fonty, reset
  App.css                vzhled komponent
api/                     Vercel serverless funkce (1 soubor = 1 endpoint)
vercel.json              SPA routing
```

Klíč v localStorage: `watchlist.v1`.

## Nasazení (GitHub → Vercel)

Jednorázové napojení: https://vercel.com → „Add New Project" → vyber repo → Deploy (preset „Vite" se pozná sám).

Od té chvíle každý `git push` na `main` nasadí novou verzi, ostatní branche dostanou preview URL.

## Kam dál

- **Sdílení mezi zařízeními** - dneska je seznam vázaný na jeden prohlížeč. Přenos řeší Export/Import; trvale to vyřeší backend v `api/` nad Vercel Postgres nebo KV.
- **Doplňování z databáze filmů** - TMDB / AniList API místo ručního psaní názvů (potřebuje API klíč v env proměnných, proto volání přes `api/`, ne z prohlížeče).
- **Vlastní doména** - zdarma subdoména přes https://is-a.dev, nebo koupená doména v Settings → Domains.
