/**
 * Confirmed public facts only. Gear captures and equipment stay absent
 * until a player provides them. Do not invent biographies or personal data.
 */
export const officers = [
  { id: "kirbozz", name: "Kirbozz", role: "leader", gear: "I" },
  { id: "erakis", name: "Erakis", role: "deputy", gear: "I" },
  { id: "yexiu", name: "Yexiu", role: "lieutenant", gear: "I" },
] as const;

export type OfficerRole = (typeof officers)[number]["role"];
