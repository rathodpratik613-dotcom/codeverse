# CODEVERSE — Learn Coding Through Gaming

A gamified programming education platform. Students learn 19 languages through
interactive lessons, a Monaco code editor, challenges, quizzes, XP/coins,
achievements, and leaderboards.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** — dark gaming theme
- **Monaco Editor** — code editing (client-side JS execution)
- **LowDB** — zero-dependency JSON-file database (`data/codeverse.json`)
- **bcryptjs** — password hashing · **jsonwebtoken** — session tokens
- **Zod** — API input validation + content schema validation

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit JWT_SECRET
npm run dev                  # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | yes (prod) | Long random string. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `DATA_DIR` | no | Directory for `codeverse.json`. Default `./data`. On Render set to the mounted disk path (e.g. `/var/data`). |
| `NODE_ENV` | no | `development` or `production` |

See `.env.example` — never commit real secrets.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run content:validate` | Validate all files in `content/` against Zod schemas |
| `npm run content:stats` | Content statistics |
| `npm run content:verify` | Verify challenge solutions |
| `npm run content:import` | Bulk-import `content/` JSON into the database (see below) |

## Authentication

- Signup/login store users in LowDB with **bcrypt-hashed** passwords.
- Login sets an **httpOnly, SameSite=Lax** JWT cookie. `rememberMe` extends
  the session cookie + JWT to 30 days (default 7).
- Sessions are tracked server-side; **logout, password reset, and session
  expiry all revoke access** — every protected API route validates both the
  JWT and the session record.
- Forgot/reset password: `POST /api/auth/forgot-password` creates a 1-hour
  reset token; `POST /api/auth/reset-password` consumes it and revokes all
  sessions. In non-production the token is returned as `devResetToken`;
  wire an email provider to deliver links in production.

## Content pipeline

Course content lives as JSON files under `content/` (languages → courses →
modules → lessons/quizzes/challenges/debug/puzzles, plus projects, missions,
achievements, glossary, cheatsheets, interview questions).

Validate, then import into the database:

```bash
npm run content:validate
npm run content:import            # chunked inserts, dedupes by type+id
npm run content:import -- --dry-run   # report only
npm run content:import -- --reset     # wipe + re-import
```

- Imports are chunked (100/write) with progress logs and skip duplicates.
- A full error report is written to `data/import-report-<ts>.json`
  (`data/` is gitignored).
- On Render, run it against the live disk:
  `render ssh` into the service, then `DATA_DIR=/var/data npm run content:import`
  (the `content/` folder ships with the repo, so it's already there).

## Deploying to Render

`render.yaml` is included (web service + 1 GB persistent disk at `/var/data`).

1. Push this repo to GitHub.
2. Render dashboard → **New → Blueprint** → select the repo. Render reads
   `render.yaml` and creates the service + disk automatically.
   (Or: New → Web Service, set the values below manually.)
3. Environment variables to set in the Render dashboard:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | generated random secret |
   | `DATA_DIR` | `/var/data` |

4. Build command: `npm install && npm run build`
   Start command: `npm start`
   Health check path: `/api/health`
5. Deploy. The app listens on `PORT` automatically (Next.js default).

Notes:
- The database is the JSON file on the **persistent disk** — it survives
  redeploys but is not multi-instance safe. Don't scale beyond 1 instance.
- `secure` cookies require HTTPS — Render provides it automatically.
- Never put `data/codeverse.json` or `.env*` in git (already gitignored).

## Project structure

```
src/
  app/            # pages + api routes (auth, xp, progress, submissions, ...)
  components/     # navbar, lesson navigation
  data/           # static course/language definitions used by the UI
  lib/            # auth.ts (JWT + sessions + bcrypt), db.ts (LowDB), auth-context.tsx
  schemas/        # Zod content schemas
content/          # JSON content dataset (validated + imported via scripts)
scripts/          # validate / stats / verify / import content
```

## Known limitations

- Only JavaScript executes (in the browser). Python needs Pyodide; other
  languages are placeholders.
- Server-side `/api/execute` is disabled (previously a security risk).
- No email delivery yet — password reset tokens are dev-mode only until an
  email provider is configured.
- Content JSON is imported into LowDB, but lesson pages still read from the
  static `src/data/` definitions — wiring pages to `contentItems` is future work.
