# webapp-template

Frontend (React + Vite) + backend (Vercel serverless funkce ve složce `api/`) v jednom repu. Každý `git push` na `main` automaticky nasadí novou verzi.

## Lokální vývoj

```bash
npm install
npm run dev          # jen frontend, běží na http://localhost:5173
```

Pro otestování backendu lokálně (volitelné, potřebuje Vercel CLI):

```bash
npm install -g vercel
vercel dev            # frontend + /api funkce dohromady
```

## Struktura

```
src/          React frontend (Vite)
api/          Backend - každý soubor = 1 serverless endpoint
  hello.js -> dostupné na /api/hello
vercel.json   SPA routing pravidlo pro Vercel
```

Nový endpoint = nový soubor v `api/`, např. `api/users.js` bude dostupný na `/api/users`.

## Nasazení (GitHub -> Vercel, deploy přes git push)

1. Vytvoř prázdný repo na GitHubu a napoj ho na tento projekt:
   ```bash
   git remote add origin git@github.com:<tvuj-ucet>/webapp-template.git
   git branch -M main
   git push -u origin main
   ```
2. Jdi na https://vercel.com, přihlas se přes GitHub účet.
3. "Add New Project" -> vyber tento repo -> "Deploy" (Vercel framework preset "Vite" pozná automaticky).
4. Hotovo - appka běží na `https://<nazev-projektu>.vercel.app`. Od teď stačí `git push` na `main` a Vercel automaticky nasadí novou verzi (u ostatních branchí/PR vytvoří preview URL).

## Doména

- Zdarma: subdoména `*.vercel.app`, kterou dostaneš automaticky.
- Vlastní subdoména zdarma: https://is-a.dev (PR na jejich GitHub repo, pak nastavíš CNAME na Vercel).
- Vlastní TLD (`.dev`, `.app`, `.cz`...): koupit u registrátora a v nastavení projektu na Vercelu -> Settings -> Domains přidat a nasměrovat DNS podle jejich návodu.
