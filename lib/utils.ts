export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const transliterationMap: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya"
};

export function transliterateRuToLatin(value: string) {
  return value
    .toLowerCase()
    .split("")
    .map((char) => transliterationMap[char] ?? char)
    .join("");
}

export function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).slice(0, 6);
}

export function safeLatinSlug(value: string, suffix?: string | number | null) {
  const cleaned = transliterateRuToLatin(value)
    .replace(/\b(?:ot|na|iz|s|c)\b/g, " ")
    .replace(/kopiya/gi, " ")
    .replace(/copy/gi, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safeSuffix = suffix ? String(suffix).toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 8) : "";

  return [cleaned || "lineup", safeSuffix].filter(Boolean).join("-");
}

export function toTextArray(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function nullableString(value: FormDataEntryValue | null) {
  const result = String(value ?? "").trim();
  return result ? result : null;
}

export function toAbsoluteUrl(baseUrl: string, href: string | null | undefined) {
  if (!href) {
    return null;
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}
