import type { Locale } from "@/i18n/routing";
import type { ApplicationSchemaValues } from "./schema";
import type { ApplicationPayload } from "./types";

function blankToUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toApplicationPayload(
  values: ApplicationSchemaValues,
  locale: Locale,
): ApplicationPayload {
  const otherLanguage = values.spokenLanguages.includes("other")
    ? blankToUndefined(values.otherLanguage)
    : undefined;

  return {
    locale,
    preparedAt: new Date().toISOString(),
    identity: {
      osrNickname: values.osrNickname.trim(),
      discordUsername: values.discordUsername.trim(),
      mainGear: values.mainGear,
      level: values.level,
      spokenLanguages: values.spokenLanguages,
      otherLanguage,
    },
    experience: {
      aceOnlineExperience: values.aceOnlineExperience.trim(),
      previousBrigade: blankToUndefined(values.previousBrigade),
      playHours: values.playHours,
    },
    motivation: {
      reason: values.motivation.trim(),
      codeAccepted: true,
    },
  };
}
