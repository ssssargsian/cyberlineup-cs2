# CyberLineup SR — Context

## Project goal
CyberLineup SR — платформа поиска раскидов CS2 с импортом внешней базы, поиском, страницами раскидов и ИИ-ассистентом.

Пользователь ищет обычным текстом: `смок б даст`, `smoke b dust2`, `флеш мид мираж`, `молик банан инферно`, `smoke ct spawn mid inferno`.

ИИ-ассистент отвечает только на основе данных из базы и не имеет права выдумывать раскиды.

## Current architecture
- Next.js App Router
- TypeScript
- Prisma/PostgreSQL
- Tailwind
- Cheerio parser
- JSON export/import
- Admin moderation flow
- Optional OpenAI assistant
- CLI bootstrap for real imported data

## Important files
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/lib/search.ts`
- `src/lib/i18n/lineupDisplay.ts`
- `src/lib/importers/types.ts`
- `src/lib/importers/raskidkiGranatCrawler.ts`
- `src/lib/importers/raskidkiGranatParser.ts`
- `src/lib/importers/normalizeLineup.ts`
- `src/lib/importers/importToDatabase.ts`
- `src/lib/importers/websiteImporter.ts`
- `scripts/export-raskidki-json.ts`
- `scripts/audit-raskidki-json.ts`
- `scripts/import-raskidki.ts`
- `scripts/wait-for-db.ts`
- `scripts/publish-imported-lineups.ts`
- `scripts/hide-demo-lineups.ts`
- `scripts/merge-duplicate-maps.ts`
- `scripts/repair-lineup-slugs.ts`
- `scripts/bootstrap-real.ts`
- `docs/skills/CS2_UI_SKILL.md`
- `docs/DEPLOY_UBUNTU_PLAN.md`
- `app/admin/actions.ts`
- `app/admin/imports/page.tsx`
- `app/lineups/[slug]/page.tsx`
- `app/search/page.tsx`
- `app/assistant/page.tsx`
- `lib/assistant.ts`
- `lib/utils.ts`
- `README.md`
- `.env.example`

## What works
- Prisma schema supports maps, lineups, import sources, import jobs and search logs.
- `Lineup` supports `steps Json?`, `images Json?`, `previewImageUrl`, `aimImageUrl`, `positionImageUrl`, `sourceUrl`, `sourceName`, `importedAt`, `status`, enum `unknown` values and nullable `area`.
- Public search uses `src/lib/search.ts`, normalizes RU/EN queries and filters public output to `published`.
- Public search additionally excludes demo records even if they are accidentally `published`.
- Assistant uses `searchLineups(query)` first and falls back to a Russian template answer when `OPENAI_API_KEY` is missing.
- `/lineups/[slug]` decodes route params, searches published lineup by DB slug, renders preview, step images, gallery and source block.
- `LineupCard` links strictly to `/lineups/${lineup.slug}` and does not regenerate slug from title.
- Imported title display is russified through `formatLineupTitleRu()` without mutating the original DB title.
- New import-generated slugs use Latin-only `safeLatinSlug()` with a short source hash.
- Canonical Dust map is `Dust 2` with slug `dust-2`; `repair:maps` merges old `Dust II`/`dust-ii` duplicates.
- Imported and remote images render through `ImportedImage`, so photos are visible immediately and fallback appears only on load error or empty `src`.
- Seed demo lineups are now `rejected`, not public.
- Added CLI scripts to publish real imported data, hide demo data, merge duplicate maps, repair old unsafe slugs and run one-command bootstrap.
- Latest local DB maintenance on 2026-07-08: `repair:maps` found 0 duplicate maps, `repair:lineup-slugs` repaired 0 and skipped 1096, `hide:demo` hid 9 demo lineups, `publish:imported` published 0 new records because matching imports were already published or not pending.
- `pnpm prisma generate` and `pnpm build` passed on 2026-07-08 after the latest UI/image/map changes.

## What is incomplete
- 10 imported records from the latest audit had `utilityType = unknown`; these need manual moderation/classification.
- Local image download mode is still optional/reserved; stable MVP stores remote image URLs.

## Commands
- `pnpm install`
- `pnpm db:up`
- `pnpm db:wait`
- `pnpm prisma generate`
- `pnpm prisma migrate dev`
- `pnpm prisma db seed`
- `pnpm export:raskidki`
- `pnpm audit:raskidki`
- `pnpm import:raskidki`
- `pnpm repair:maps`
- `pnpm publish:imported`
- `pnpm hide:demo`
- `pnpm repair:lineup-slugs`
- `pnpm sync:raskidki`
- `pnpm bootstrap:real`
- `pnpm dev:real`
- `pnpm build`
- `pnpm dev`

## Rules
- Не переписывать проект с нуля.
- Не ломать текущие маршруты.
- Не выдумывать данные в ассистенте.
- Публично показывать только `published`.
- Публично не показывать demo.
- Imported lineups по умолчанию `pending_review`.
- `sourceUrl` и `sourceName` обязательны для импортированных данных.
- Фото по умолчанию хранить как remote URL.
- Slugs должны быть латиницей: только `a-z`, `0-9`, `-`.
- Не переводить `sourceUrl` и `slug`.
- UI должен быть на русском.
- Дизайн должен соответствовать `docs/DESIGN_SYSTEM.md`.
