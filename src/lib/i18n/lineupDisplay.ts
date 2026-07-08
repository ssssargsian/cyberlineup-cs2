import type { Difficulty, LineupStatus, Side, UtilityType } from "@prisma/client";

export function formatUtilityTypeRu(value?: UtilityType | string | null) {
  switch (value) {
    case "smoke":
      return "Смок";
    case "flash":
      return "Флешка";
    case "molotov":
      return "Молотов";
    case "he":
      return "HE";
    case "oneway":
      return "Ванвей";
    default:
      return "Не указано";
  }
}

export function formatDifficultyRu(value?: Difficulty | string | null) {
  switch (value) {
    case "easy":
      return "Лёгкая";
    case "medium":
      return "Средняя";
    case "hard":
      return "Сложная";
    default:
      return "Не указана";
  }
}

export function formatSideRu(value?: Side | string | null) {
  switch (value) {
    case "t":
      return "T";
    case "ct":
      return "CT";
    case "both":
      return "Обе";
    default:
      return "Не указана";
  }
}

export function formatStatusRu(value?: LineupStatus | string | null) {
  switch (value) {
    case "published":
      return "Опубликовано";
    case "pending_review":
      return "На модерации";
    case "draft":
      return "Черновик";
    case "rejected":
      return "Отклонено";
    default:
      return "Не указано";
  }
}

export function formatThrowTypeRu(value?: string | null) {
  switch (value) {
    case "left-click":
      return "ЛКМ";
    case "right-click":
      return "ПКМ";
    case "jumpthrow":
      return "Jumpthrow";
    case "runthrow":
      return "Runthrow";
    case "walkthrow":
      return "Walkthrow";
    default:
      return "Не указан";
  }
}

export function formatAreaRu(value?: string | null) {
  return value?.trim() || "Не указана";
}

const mapDescriptionsRu: Record<string, string> = {
  ancient: "Карта с плотными углами, контролем cave и выходами на сайты, где важна точная работа гранатами.",
  anubis: "Длинные линии, быстрые стычки за canal и агрессивные ротации между двумя плентами.",
  "dust-2": "Классическая карта с быстрыми выходами, жёсткой борьбой за mid и сильной ролью смоков на B.",
  "dust-ii": "Классическая карта с быстрыми выходами, жёсткой борьбой за mid и сильной ролью смоков на B.",
  inferno: "Карта, где контроль Banana, тайминги и молотовы часто решают весь раунд.",
  mirage: "Карта контроля middle, connector и многоуровневых A/B-выходов.",
  nuke: "Вертикальная карта с outside-смоками, upper-выходами и плотными таймингами.",
  office: "Закрытая карта с узкими проходами, флешками и контролем choke points.",
  overpass: "Карта с многоуровневым контролем, connector, toilets, long и выходами на B.",
  train: "Длинные линии, layered bombsites и сильные гранаты вокруг trains, ladders и ivy.",
  vertigo: "Карта, где давление на ramp, тайминги и точные гранаты имеют ключевое значение."
};

export function formatMapNameRu(name?: string | null, slug?: string | null) {
  if (slug === "dust-2" || slug === "dust-ii" || slug === "dust2" || name === "Dust II") {
    return "Dust 2";
  }

  if (!name || name === "Unknown") {
    return "Карта не указана";
  }

  return name?.trim() || "Карта не указана";
}

export function formatMapDescriptionRu(slug?: string | null, fallback?: string | null) {
  if (slug && mapDescriptionsRu[slug]) {
    return mapDescriptionsRu[slug];
  }

  return fallback?.trim() || "Описание карты пока не добавлено.";
}

export function formatLineupCountRu(count?: number | null) {
  const value = count ?? 0;
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${value} опубликованный раскид`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${value} опубликованных раскида`;
  }

  return `${value} опубликованных раскидов`;
}

export function formatLineupTitleRu(title: string) {
  return title
    .replace(/kopiya[-\s]*/gi, " ")
    .replace(/копия[-\s]*/gi, " ")
    .replace(/^smoke\b/i, "Смок")
    .replace(/^flash\b/i, "Флешка")
    .replace(/^molotov\b/i, "Молотов")
    .replace(/^hegrenade\b/i, "HE")
    .replace(/^he\b/i, "HE")
    .replace(/^one\s?way\b/i, "Ванвей")
    .replace(/^oneway\b/i, "Ванвей")
    .replace(/\s+-\s+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
