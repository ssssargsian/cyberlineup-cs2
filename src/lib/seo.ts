export const SITE_URL = "https://cyberlineup.ru";
export const SITE_NAME = "CyberLineup";
export const DEFAULT_SEO_TITLE = "CyberLineup — раскидки CS2";
export const HOME_SEO_TITLE = "CyberLineup — раскидки CS2 за секунды";
export const DEFAULT_SEO_DESCRIPTION = "Быстрый поиск раскидок CS2: смоки, флешки, молотовы и HE с фото шагов.";
export const HOME_SEO_DESCRIPTION =
  "CyberLineup — быстрый поиск раскидок CS2: смоки, флешки, молотовы и HE. Ищите раскидки обычным языком и открывайте шаги с фото.";
export const OG_IMAGE_URL = "/og-image.svg";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
