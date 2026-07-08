# CyberLineup SR

CyberLineup SR (`SR = Sargsian Rafik`) — MVP веб-платформа для поиска, обучения и модерации раскидов гранат в CS2.

Платформа умеет искать раскиды обычным текстом, импортировать внешнюю базу через moderation-first pipeline, показывать страницы раскидов с фотографиями шагов и отвечать ассистентом только по данным из базы.

## 1. Установка

```bash
pnpm install
pnpm prisma generate
```

Быстрый запуск с реальными импортированными данными:

```bash
pnpm bootstrap:real
pnpm dev
```

Или одной командой:

```bash
pnpm dev:real
```

`bootstrap:real` поднимает PostgreSQL, ждёт готовности БД, применяет миграции, запускает seed без публичных demo-раскидов, экспортирует реальные раскиды, делает аудит JSON, импортирует данные, склеивает дубли карт, чинит slug, публикует реальные записи источника `ГАЙД CS2`, скрывает demo и запускает production build.

## 2. Настройка PostgreSQL

Локально можно поднять Postgres через Docker:

```bash
pnpm db:up
```

Остановить контейнер:

```bash
pnpm db:down
```

## 3. `.env`

Скопируйте `.env.example` в `.env` и заполните значения:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cyberlineup_sr?schema=public"
ADMIN_PASSWORD="change-me"
OPENAI_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"

RASKIDKI_SOURCE_URL="https://xn----7sbbane1abpc1b0aig0a.xn--p1ai/raskidki-granat-counter-strike-2/"
ENABLE_WEB_FALLBACK=false

IMAGE_STORAGE_MODE="remote"
DOWNLOAD_IMPORT_IMAGES=false
AUTO_PUBLISH_IMPORTED=false
FORCE_UPDATE_IMPORTED=false
```

По умолчанию импорт хранит картинки как remote URL и не публикует записи автоматически.

## 4. Prisma generate

```bash
pnpm prisma generate
```

## 5. Prisma migrate

```bash
pnpm prisma migrate dev
```

Для production/deploy:

```bash
pnpm prisma migrate deploy
```

## 6. Запуск сайта

```bash
pnpm dev
```

Сайт будет доступен на [http://localhost:3000](http://localhost:3000).

Production-проверка после build:

```bash
pnpm build
pnpm start
```

## 7. Админка

- URL: `/admin`
- Пароль берётся из `ADMIN_PASSWORD`
- Раздел импорта: `/admin/imports`

В админке можно создавать и редактировать карты/раскиды, запускать импорт, смотреть jobs, публиковать или отклонять `pending_review`.

## 8. Импорт JSON

Собрать JSON из источника:

```bash
pnpm export:raskidki
```

Crawler:
- проверяет `robots.txt`;
- читает `sitemap.xml` и `sitemap_index.xml`;
- добирает ссылки из HTML-каталога;
- не ходит по query URL;
- работает внутри `/raskidki-granat-counter-strike-2/`;
- использует concurrency 3, retry 2, timeout 20 секунд и задержку 800-1500 мс.

JSON сохраняется в `data/raskidki-import.json`.

## 9. Аудит JSON

```bash
pnpm audit:raskidki
```

Команда выводит:
- total lineups;
- распределение по картам;
- распределение по типам гранат;
- сколько записей с preview/images/steps/step images;
- сколько дублей `sourceUrl` и `slug`;
- сколько `unknown` map/utilityType.

## 10. Импорт в БД

```bash
pnpm import:raskidki
```

Импорт:
- создаёт карты, если их нет;
- определяет уникальность по `sourceUrl`, затем `slug`;
- новые записи сохраняет как `pending_review`;
- не затирает ручные правки;
- обновляет пустые поля;
- обновляет `steps/images`, если они пустые или `FORCE_UPDATE_IMPORTED=true`.

## 11. Синхронизация

Полный цикл export + import:

```bash
pnpm sync:raskidki
```

Через UI тот же поток доступен в `/admin/imports` кнопками `Собрать JSON`, `Импортировать в базу`, `Синхронизировать`.

## 12. Публикация `pending_review` и скрытие demo

Публичный сайт показывает только `published`.

После импорта откройте `/admin/imports`, проверьте источник, title, карту, тип гранаты, steps/images и нажмите `Опубликовать`. Массовая публикация доступна кнопкой `Опубликовать все импортированные`, рядом показано предупреждение о необходимости проверки данных.

Опубликовать реальные импортированные записи из источника:

```bash
pnpm publish:imported
```

Скрыть demo-данные:

```bash
pnpm hide:demo
```

Demo-записи нужны только для разработки. Они создаются как `rejected` и дополнительно исключаются из публичного поиска, даже если старые записи случайно остались `published`.

Починить старые slug с кириллицей:

```bash
pnpm repair:lineup-slugs
```

Новые импортированные slugs создаются латиницей: только `a-z`, `0-9`, дефис и короткий hash источника.

## 13. Фото: remote/local mode

Default:

```env
IMAGE_STORAGE_MODE="remote"
DOWNLOAD_IMPORT_IMAGES=false
```

В remote mode картинки не скачиваются в проект. В JSON и БД сохраняются абсолютные URL источника, `sourceImageUrl/sourceUrl`, `previewImageUrl`, `aimImageUrl`, `positionImageUrl` и `images[]`.

`next.config.mjs` разрешает remote images с домена источника. UI использует обычный `img`, поэтому punycode/Next Image ограничения не блокируют отображение.

Local mode зарезервирован переменными:

```env
IMAGE_STORAGE_MODE="local"
DOWNLOAD_IMPORT_IMAGES=true
```

Текущий стабильный путь для MVP — remote URL с обязательным source attribution.

## 14. Деплой на Vercel

1. Создайте PostgreSQL базу.
2. Добавьте env-переменные из `.env.example`.
3. Запустите миграции:

```bash
pnpm prisma migrate deploy
```

4. При необходимости выполните seed:

```bash
pnpm prisma db seed
```

5. Импорт лучше запускать вручную или отдельной админ-операцией, а не на каждом deploy.

План будущего деплоя на Ubuntu описан в [docs/DEPLOY_UBUNTU_PLAN.md](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/docs/DEPLOY_UBUNTU_PLAN.md).

## Команды

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm export:raskidki
pnpm audit:raskidki
pnpm import:raskidki
pnpm repair:maps
pnpm publish:imported
pnpm hide:demo
pnpm repair:lineup-slugs
pnpm sync:raskidki
pnpm bootstrap:real
pnpm dev:real
pnpm build
pnpm dev
```

## API

### `GET /api/search?q=...`

Нормализует запрос, определяет intent и ищет только по `published` lineups.

### `POST /api/assistant`

Ассистент сначала вызывает `searchLineups(query)`. Если результатов нет, возвращает `В базе пока нет подходящих раскидов`. Если `OPENAI_API_KEY` есть, модель получает только найденные записи из базы и не должна придумывать новые раскиды.

### Admin API

- `POST /api/admin/import/run`
- `GET /api/admin/import/jobs`
- `POST /api/admin/lineups/[id]/publish`
- `POST /api/admin/lineups/[id]/reject`

## Импортёры

- [types.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/types.ts)
- [raskidkiGranatCrawler.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/raskidkiGranatCrawler.ts)
- [raskidkiGranatParser.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/raskidkiGranatParser.ts)
- [normalizeLineup.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/normalizeLineup.ts)
- [importToDatabase.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/importToDatabase.ts)
- [websiteImporter.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/src/lib/importers/websiteImporter.ts)
- [export-raskidki-json.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/export-raskidki-json.ts)
- [audit-raskidki-json.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/audit-raskidki-json.ts)
- [import-raskidki.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/import-raskidki.ts)
- [publish-imported-lineups.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/publish-imported-lineups.ts)
- [hide-demo-lineups.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/hide-demo-lineups.ts)
- [repair-lineup-slugs.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/repair-lineup-slugs.ts)
- [bootstrap-real.ts](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/scripts/bootstrap-real.ts)
- [raskidki-import.json](/Users/sargsian/Documents/Codex/2026-07-07/mvp-cs2-cs2-lineups-assistant-he/data/raskidki-import.json)
