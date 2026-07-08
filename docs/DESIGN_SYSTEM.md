# CyberLineup SR — Design System

UI-задачи также должны соблюдать `docs/skills/CS2_UI_SKILL.md`.

## Visual concept
CyberLineup SR выглядит как премиальный CS2-инструмент, а не как обычный тёмный шаблон.

Ощущение:
- CS2 match stats
- FACEIT lobby/cards
- Leetify analytics
- CYBERSHOKE server browser
- Apple/Linear аккуратность

Не копировать чужой дизайн напрямую. Стиль: dark tactical premium, стеклянные игровые панели, крупные превью, понятные бейджи и быстрый визуальный разбор `тип гранаты → карта → откуда → куда`.

## Colors
Background:
- `#05070D`
- `#070A12`
- `#0B1020`

Panels:
- `rgba(13, 18, 32, 0.86)`
- `rgba(255, 255, 255, 0.04)`

Borders:
- `rgba(255,255,255,0.08)`
- `rgba(34,211,238,0.22)`

Accents:
- cyan `#22D3EE`
- blue `#3B82F6`
- violet `#8B5CF6`
- orange `#F59E0B`
- red-orange `#F97316`
- green `#22C55E`

Utility colors:
- Смок: cyan/blue
- Флешка: amber/yellow
- Молотов: orange/red
- HE: green
- Ванвей: violet
- Не указано: gray

## Typography
- Интерфейс на русском.
- Заголовки жирные, плотные, как в esports UI.
- Uppercase использовать только для коротких labels, не для основного текста.
- Меньше серого текста: ключевые данные должны иметь высокий контраст.
- Главное действие должно быть визуально очевидным.

## Layout
- mobile-first;
- max-width containers;
- hero sections;
- grid cards;
- sticky/clear navigation if needed;
- spacing consistent;
- изображения на mobile во всю ширину, без поломки карточек.

## Cards
- `rounded-2xl` или `rounded-3xl`;
- glassmorphism;
- soft border;
- subtle cyan/violet glow;
- hover lift;
- preview image сверху;
- image zoom около `1.03` on hover;
- badges в одну строку;
- `fromPosition → targetPosition` должен читаться быстро;
- если нет фото, показывать tactical gradient fallback и текст `Нет фото`.

## Buttons
Primary:
- cyan/blue/violet gradient;
- glow on hover;
- `rounded-xl` или `rounded-2xl`;
- clear CTA.

Secondary:
- transparent;
- border;
- soft hover.

Danger:
- rose/red border;
- использовать для reject/delete/hide demo.

## Badges
Смок:
- cyan/blue

Флешка:
- yellow/amber

Молотов:
- orange/red

HE:
- green

Ванвей:
- violet

Проверено:
- green/cyan

Источник:
- neutral blue/gray

## Pages
Главная:
- крупный логотип CyberLineup SR;
- подзаголовок `ИИ-помощник по раскидам CS2`;
- большой поиск;
- примеры запросов;
- быстрые карты;
- блоки Smoke / Flash / Molotov / HE можно оставлять как игровые категории, но UI-labels должны быть русскими;
- блок `База раскидов`;
- блок `Импортировано из источников`.

Search:
- фильтры сверху на mobile, сеткой на desktop;
- результаты карточками;
- показывать, как система поняла запрос: карта, тип гранаты, зона;
- empty state должен быть красивый и на русском;
- публично не показывать demo/draft/pending/rejected.

Lineup detail:
- hero с `previewImageUrl`;
- overlay gradient;
- title через `formatLineupTitleRu()`;
- карта, тип гранаты, `from → target`;
- блок `Как кинуть` со step images;
- блок `Детали`;
- блок `Источник`;
- галерея `images[]`, если есть;
- похожие раскиды.

Admin:
- проще и функциональнее, но в том же стиле;
- таблицы читаемые;
- pending_review import удобный;
- кнопки `Опубликовать`, `Отклонить`, `Редактировать`, `Скрыть demo-данные`;
- предупреждать перед массовой публикацией: `Проверьте корректность данных и наличие источника перед публикацией.`

## UI components
Желательно использовать или создать:
- Button
- Card
- Badge
- Input
- Section
- PageHeader
- EmptyState
- LoadingSkeleton
- LineupCard
- UtilityTypeBadge
- DifficultyBadge
- SourceBadge
- ImportStatusBadge

## i18n rules
- Не показывать `UNKNOWN`, `Published`, `Pending review`, `Open`, `Step`, `No video` в публичном UI.
- Использовать `src/lib/i18n/lineupDisplay.ts`.
- Не переводить `sourceUrl`.
- Не переводить `slug`.
- Не менять исходный `title` в БД ради UI; показывать `formatLineupTitleRu(title)`.

## Forbidden
- белый Bootstrap-style;
- случайные цвета;
- кислотный neon без меры;
- разные стили на разных страницах;
- перегруженные карточки;
- отсутствие mobile адаптации;
- копирование чужого сайта 1 в 1.

Все новые UI-правки должны соответствовать этому файлу.
Не менять дизайн хаотично.
