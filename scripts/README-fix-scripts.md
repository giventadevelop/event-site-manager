# Maintenance scripts (`fix-*`)

One-off and repeatable **content/code fix** utilities for this repo. They live under `scripts/` only (not the repo root).

**Security:** Reviewed May 2026 — these scripts do **not** hardcode API keys, passwords, Stripe/Clerk secrets, or database URLs. They read/write project files under `src/` (mostly `src/app/mosc`) and use env only where noted elsewhere (e.g. Amplify env scripts).

## MOSC / Next.js content fixes

| Script | Purpose | Typical usage |
|--------|---------|----------------|
| `fix-mosc-directives.js` | Fix `'use client'` / `'use server'` directive quoting in MOSC pages | `node scripts/fix-mosc-directives.js` |
| `fix-mosc-quotes.js` | Quote fixes in MOSC TSX files | `node scripts/fix-mosc-quotes.js` |
| `fix-mosc-simple.js` | Simpler MOSC quote/string pass | `node scripts/fix-mosc-simple.js` |
| `fix-mosc-trailing-quotes.js` | Remove stray trailing quotes in MOSC files | `node scripts/fix-mosc-trailing-quotes.js` |
| `fix-mosc-line-wrapping.js` | Line-wrapping cleanup in MOSC content | `node scripts/fix-mosc-line-wrapping.js` |
| `fix-mosc-final.js` | Combined/final MOSC text pass | `node scripts/fix-mosc-final.js` |
| `fix-mosc-images.js` | Image wrapper/layout fixes on MOSC `page.tsx` files | `node scripts/fix-mosc-images.js` |
| `fix-mosc-images-phase2.js` | Second-phase MOSC image layout fixes | `node scripts/fix-mosc-images-phase2.js` |
| `fix-holy-synod-layout.js` | Holy Synod page layout adjustments | `node scripts/fix-holy-synod-layout.js` |

## Metadata & typography

| Script | Purpose | Typical usage |
|--------|---------|----------------|
| `fix-metadata.py` | Fix `export const metadata` quote syntax (Python) | `python scripts/fix-metadata.py` |
| `fix-apostrophes.sh` | Same class of metadata apostrophe fixes (bash/sed) | Git Bash: `bash scripts/fix-apostrophes.sh` |
| `fix-quotes.ts` | Replace smart/curly quotes project-wide (TS/TSX) | `npx tsx scripts/fix-quotes.ts` |

## App / refactor helpers

| Script | Purpose | Typical usage |
|--------|---------|----------------|
| `fix-app-url.cjs` | Migrate hardcoded app URLs to `getAppUrl()` in listed files | `node scripts/fix-app-url.cjs` |

## Notes

- Run from **repository root** so relative paths (`src/app/mosc`, etc.) resolve correctly.
- Prefer **git commit or branch** before bulk runs; these scripts modify many files.
- Duplicate `fix-*` copies previously at the repo root were removed; use paths under `scripts/` only.

## Related

- Amplify env tooling: [`ENV_VARS_README.md`](./ENV_VARS_README.md)
- Task runner / PRD tools: [`README.md`](./README.md) (`dev.js`)
