import { Difficulty, LineupStatus, Side, UtilityType } from "@prisma/client";

export const APP_NAME = "CyberLineup";
export const APP_TAGLINE = "ИИ-помощник по раскидам CS2";
export const APP_SUBTITLE = "Премиальный сервис для поиска, обучения и модерации раскидов гранат в Counter-Strike 2.";

export const SEARCH_PLACEHOLDER =
  "Например: смок Б Dust 2, флеш мид Mirage, молик car Inferno";

export const MAPS = [
  { name: "Dust 2", slug: "dust-2" },
  { name: "Mirage", slug: "mirage" },
  { name: "Inferno", slug: "inferno" },
  { name: "Nuke", slug: "nuke" },
  { name: "Ancient", slug: "ancient" },
  { name: "Anubis", slug: "anubis" },
  { name: "Vertigo", slug: "vertigo" },
  { name: "Overpass", slug: "overpass" },
  { name: "Office", slug: "office" },
  { name: "Train", slug: "train" }
] as const;

export const POPULAR_QUERIES = [
  "смок б даст",
  "флеш мид mirage",
  "молик car inferno",
  "smoke connector mirage",
  "oneway window mirage",
  "he cave ancient"
];

export const BENEFITS = [
  "Поиск по обычному тексту без жёстких фильтров",
  "Смоки, флешки, молотовы, HE и ванвеи",
  "Видео, превью и пошаговые инструкции",
  "База пополняется через источники и импорт",
  "Каждый импорт проходит модерацию перед публикацией"
];

export const UTILITY_LABELS: Record<UtilityType, string> = {
  smoke: "Смок",
  flash: "Флешка",
  molotov: "Молотов",
  he: "HE",
  oneway: "Ванвей",
  unknown: "Не указано"
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
  unknown: "Не указана"
};

export const SIDE_LABELS: Record<Side, string> = {
  t: "T",
  ct: "CT",
  both: "Обе",
  unknown: "Не указана"
};

export const STATUS_LABELS: Record<LineupStatus, string> = {
  draft: "Черновик",
  pending_review: "На модерации",
  published: "Опубликовано",
  rejected: "Отклонено"
};

export const MAP_HERO_ACCENTS: Record<string, string> = {
  "dust-2": "from-amber-500/35 via-sky-500/10 to-transparent",
  mirage: "from-cyan-500/35 via-blue-500/15 to-transparent",
  inferno: "from-orange-500/35 via-red-500/15 to-transparent",
  nuke: "from-emerald-500/35 via-cyan-500/10 to-transparent",
  ancient: "from-lime-500/30 via-emerald-500/10 to-transparent",
  anubis: "from-blue-500/30 via-violet-500/10 to-transparent",
  vertigo: "from-violet-500/35 via-blue-500/15 to-transparent",
  overpass: "from-teal-500/30 via-slate-500/20 to-transparent",
  office: "from-slate-500/30 via-blue-500/10 to-transparent",
  train: "from-amber-500/35 via-orange-500/10 to-transparent"
};
