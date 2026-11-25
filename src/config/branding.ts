export const branding = {
  acronym: "VIT",
  fullName: "VatallusInfusedTemplars",
  game: "AceOnline",
  nation: "BCU",
  server: "Old School Rivals",
  serverUrl: "https://oldschoolrivals.com/",
  logoPath: "/brand/vit-logo.png",
  logoFile: "brand/vit-logo.png",
} as const;

/** Spaced capitals for display. The official name stays `branding.fullName`. */
export const brigadeDisplayName = branding.fullName.replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();

export const valueIds = [
  "brotherhood",
  "loyalty",
  "honour",
  "respect",
  "discipline",
  "excellence",
  "support",
  "competitive",
] as const;

/**
 * Homepage story. Respect, discipline, mutual support and competitive spirit
 * stay in `valueIds` and in the recruitment code. They are not dropped.
 */
export const featuredValueIds = ["brotherhood", "loyalty", "honour", "excellence"] as const;

export type ValueId = (typeof valueIds)[number];

export const homeSectionIds = {
  statistics: "statistics",
  about: "brotherhood",
  values: "code",
  media: "media",
  recruitment: "recruitment",
} as const;
