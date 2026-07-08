# CyberLineup — Design System

UI-задачи также должны соблюдать `docs/skills/CS2_UI_SKILL.md`.

## Visual concept
CyberLineup выглядит как чистый, современный CS2-инструмент, а не как перегруженный тёмный шаблон.

Ощущение:
- CS2 match stats
- FACEIT lobby/cards
- Leetify analytics
- CYBERSHOKE server browser
- Apple/Linear аккуратность

Не копировать чужой дизайн напрямую. Стиль: Dark Minimal Gaming SaaS. Нужны понятный поиск, читаемая типографика, мягкие тёмные панели, умеренные orange/cyan accents и быстрый визуальный разбор `тип гранаты → карта → откуда → куда`.

## Colors
Background:
- main `#05070D`
- panel dark `#0B0F18`
- panel `#111827`
- panel elevated `#151B28`
- tactical blue `#0A1420`

Panels:
- solid dark panels: `#0B0F18` at 80-95%
- inner blocks: `rgba(255,255,255,0.04)`
- black HUD panels: `rgba(0,0,0,0.18-0.28)`

Borders:
- default `rgba(255,255,255,0.08)`
- strong `rgba(255,255,255,0.14)`
- active cyan `rgba(34,211,238,0.45)`
- active orange `rgba(245,158,11,0.45)`

Accents:
- FACEIT orange `#FF5500`
- CS2 amber `#F59E0B`
- cyan `#22D3EE`
- blue `#3B82F6`
- violet `#8B5CF6`
- green `#22C55E`
- red `#EF4444`

Utility colors:
- Смок: cyan/blue
- Флешка: amber/yellow
- Молотов: orange/red
- HE: green
- Ванвей: violet
- Не указано: gray

## Typography
- Интерфейс на русском.
- Основной текст должен быть максимально читаемым: `Inter`, `Manrope`, `system-ui`.
- Заголовки жирные, но не чрезмерно декоративные.
- Uppercase использовать только для коротких labels, не для основного текста.
- Letter-spacing использовать умеренно, особенно в бренде.
- Меньше серого текста: ключевые данные должны иметь нормальный контраст.
- Главное действие должно быть визуально очевидным.

## Layout
- mobile-first;
- max-width containers;
- hero sections;
- grid cards;
- sticky/clear navigation if needed;
- spacing consistent;
- меньше декоративных рамок и glow, больше воздуха;
- изображения на mobile во всю ширину, без поломки карточек.

## Cards
- `rounded-xl`, `rounded-2xl` или `rounded-[1.5rem]`;
- меньше стекла, больше спокойных solid panels;
- soft border;
- subtle orange/cyan glow;
- hover lift;
- preview image сверху;
- image zoom около `1.03` on hover;
- badges в одну строку;
- `fromPosition → targetPosition` должен читаться быстро;
- если нет фото, показывать tactical gradient fallback и текст `Нет фото`.

## Buttons
Primary:
- orange CTA, обычно `#FF5500` с мягким hover в `#F97316`;
- glow умеренный;
- `rounded-xl`;
- clear CTA.

Secondary:
- cyan/blue outline;
- dark panel background;
- soft hover glow.

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
- header содержит logo + `CyberLineup`; не дублировать логотип отдельной карточкой в hero;
- hero `Раскидки CS2 за секунды`;
- короткий подзаголовок про смоки, флешки, молотовы и HE;
- большой поиск как главное действие;
- компактные популярные запросы;
- stats сразу ниже hero: всего раскидок, карт, смоков, флешек, молотовых, HE;
- карты ниже статистики как быстрые входы в базу.

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
- справа sticky panel `Детали раскида`;
- блок `Источник` в sidebar;
- галерея `images[]`, если есть;
- похожие раскиды.

Images:
- `ImportedImage` использует обычный `img`, если remote/Punycode мешает Next Image;
- фото видно сразу, без `opacity-0`;
- hover может только слегка увеличить изображение (`scale 1.02-1.03`) или добавить glow;
- overlay не должен закрывать изображение полностью;
- fallback показывается только если `src` пустой или загрузка упала.

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
- MapCard
- ImportedImage
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
- перегруженный hero;
- логотип отдельной декоративной карточкой в hero;
- отсутствие mobile адаптации;
- копирование чужого сайта 1 в 1.

Все новые UI-правки должны соответствовать этому файлу.
Не менять дизайн хаотично.
