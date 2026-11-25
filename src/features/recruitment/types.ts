import type { Locale } from "@/i18n/routing";
import type { GearId, PlayHoursId } from "@/config/recruitment";

export type ApplicationPayload = {
  locale: Locale;
  preparedAt: string;
  identity: {
    osrNickname: string;
    discordUsername: string;
    mainGear: GearId;
    level: number;
    spokenLanguages: string[];
    otherLanguage?: string;
  };
  experience: {
    aceOnlineExperience: string;
    previousBrigade?: string;
    playHours: PlayHoursId;
  };
  motivation: {
    reason: string;
    codeAccepted: true;
  };
};

export type ApplicationSubmissionResult =
  | { status: "not_connected" }
  | { status: "submitted"; reference?: string }
  | { status: "error" };
