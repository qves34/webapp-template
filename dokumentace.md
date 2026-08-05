# Dokumentace - webapp-template

## Stav (2026-08-05)

Projekt je nasazený a live.

- **Produkce**: https://webapp-template-three.vercel.app/
- **Repo**: https://github.com/qves34/webapp-template
- **Deploy**: automaticky přes Vercel při `git push` na `main`

## Co je hotové

- **Watchlist appka**: seznam filmů/anime/seriálů v `localStorage` (`watchlist.v1`), stavy Chci vidět → Dívám se → Dokoukáno, filtr, hledání, Export/Import JSON s merge podle `updatedAt`
- **TMDB našeptávač**: `api/search.js` proxuje `search/multi` na TMDB (klíč `TMDB_API_KEY` jen na serveru), frontend (`AddForm.jsx`) při psaní debounced dotazem nabídne film/seriál s plakátkem a rokem; vybraný titul si nese `tmdbId`/`year`/`poster`, ruční zápis bez výběru pořád funguje (jediná cesta pro anime, TMDB ho zvlášť nerozlišuje)
- **Vercel deploy**: `vercel.json` s SPA routing pravidlem, framework preset "Vite" rozpoznán automaticky
- **Git**: napojeno na GitHub (`qves34/webapp-template`), `main` nasazen na produkci
- **Lint**: oxlint (`.oxlintrc.json`)
- **README.md**: návod pro lokální vývoj a nasazení (česky)

## Co chybí / další kroky

- `TMDB_API_KEY` zatím jen v lokálním `.env` - před dalším nasazením přidat i do Vercel Environment Variables, jinak `/api/search` na produkci vrátí 500
- Sdílení seznamu mezi zařízeními (dnes jen Export/Import, žádný backend úložiště)
- Bez routingu (React Router), testů a CI
- Vlastní doména zatím nenastavena (běží jen na `*.vercel.app`)

## Poznámka k testování

`npm run dev` (Vite) neumí spustit `api/` funkce - lokální ověření `/api/search` šlo přes malý pomocný Node server mimo repo, co jen zavolal handler napřímo. Vizuální průchod v prohlížeči (Playwright) v tomhle sandboxu nešel rozjet - chybí systémové knihovny pro headless Chromium a není root pro jejich instalaci. Backend endpoint je ale ověřený živým dotazem na TMDB (vrátil správně namapované výsledky), lint i produkční build (`npm run build`) proběhly čistě.
