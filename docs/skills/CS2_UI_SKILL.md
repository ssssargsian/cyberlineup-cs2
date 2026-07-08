# CyberLineup SR UI Skill

## Purpose
Этот документ обязателен для всех UI-правок в CyberLineup SR.
Перед изменением публичного интерфейса Codex должен читать:
- `docs/CONTEXT.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/skills/CS2_UI_SKILL.md`

## Product feel
CyberLineup SR должен ощущаться как премиальный CS2-инструмент:
- FACEIT lobby/cards
- Leetify analytics
- CYBERSHOKE server browser
- CS2 tactical utility tool
- Apple/Linear аккуратность

Не копировать чужой дизайн напрямую.

## Visual direction
Не просто dark SaaS.
Нужен dark tactical esports UI:
- плотные карточки;
- крупные изображения карт/раскидов;
- быстрый reading path: карта → граната → откуда → куда;
- акценты cyan/orange/violet;
- мягкие tactical grids;
- subtle glow;
- clean motion;
- никаких кислотных перегрузов.

## Public language
Основной язык интерфейса — русский.
Английский допустим только:
- URL;
- slug;
- sourceUrl;
- technical enum в коде;
- оригинальные позиции из источника: CT-SPAWN, B-SITE, BANAN, MID.

## Component rules
Использовать единые компоненты:
- AppShell
- Button
- Card
- Badge
- LineupCard
- MapCard
- PageHeader
- Section
- EmptyState
- ImportedImage
- UtilityTypeBadge
- DifficultyBadge

Не писать каждый раз новые случайные Tailwind-комбинации.
Если стиль повторяется — вынести в компонент.

## LineupCard requirements
Карточка раскида должна показывать:
- preview image;
- русский бейдж типа гранаты;
- сложность на русском;
- карта;
- title через `formatLineupTitleRu()`;
- area;
- `fromPosition → targetPosition`;
- source badge;
- CTA `Открыть`.

Hover:
- image zoom 1.03;
- border glow;
- slight translateY;
- no aggressive animation.

Фото:
- картинка видна сразу;
- hover не должен раскрывать скрытое изображение;
- fallback показывается только если `src` пустой или картинка не загрузилась.

## MapCard requirements
Карточка карты должна показывать:
- `КАРТА`;
- название;
- русское описание;
- количество опубликованных раскидов;
- акцентную стрелку;
- hover glow.

## Forbidden
Запрещено:
- английские UI-надписи;
- MAP / published lineups / UNKNOWN;
- случайный Bootstrap-style;
- белые страницы;
- разные стили карточек на разных страницах;
- кислотный neon без меры;
- копирование FACEIT/CYBERSHOKE 1 в 1.

## Acceptance
После любой UI-задачи:
- `pnpm build` проходит;
- публичный UI на русском;
- карточки читаемые;
- mobile не сломан;
- нет demo-записей в публичной выдаче.
