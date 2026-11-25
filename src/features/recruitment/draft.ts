import {
  playHoursIds,
  spokenLanguageIds,
  type PlayHoursId,
  type SpokenLanguageId,
} from "@/config/recruitment";
import type { ApplicationStepId } from "@/config/recruitment";
import { applicationSteps } from "@/config/recruitment";

export const APPLICATION_DRAFT_KEY = "vit.application.draft.v1";

export type ApplicationFormValues = {
  osrNickname: string;
  discordUsername: string;
  mainGear: string;
  level: number | undefined;
  spokenLanguages: SpokenLanguageId[];
  otherLanguage: string;
  aceOnlineExperience: string;
  previousBrigade: string;
  playHours: PlayHoursId | "";
  motivation: string;
  codeAccepted: boolean;
};

export type ApplicationDraft = {
  step: number;
  values: ApplicationFormValues;
};

export const emptyApplication: ApplicationFormValues = {
  osrNickname: "",
  discordUsername: "",
  mainGear: "",
  level: undefined,
  spokenLanguages: [],
  otherLanguage: "",
  aceOnlineExperience: "",
  previousBrigade: "",
  playHours: "",
  motivation: "",
  codeAccepted: false,
};

function isSpokenLanguage(value: unknown): value is SpokenLanguageId {
  return (
    typeof value === "string" &&
    spokenLanguageIds.some((language) => language === value)
  );
}

function isPlayHours(value: unknown): value is PlayHoursId {
  return typeof value === "string" && playHoursIds.some((option) => option === value);
}

function asString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

export function sanitizeDraft(value: unknown): ApplicationDraft | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<ApplicationDraft>;
  const raw = record.values;
  if (!raw || typeof raw !== "object") return null;

  const languages = Array.isArray(raw.spokenLanguages)
    ? raw.spokenLanguages.filter(isSpokenLanguage)
    : [];

  const values: ApplicationFormValues = {
    osrNickname: asString(raw.osrNickname, 40),
    discordUsername: asString(raw.discordUsername, 40),
    mainGear: asString(raw.mainGear, 8),
    level:
      typeof raw.level === "number" && Number.isFinite(raw.level)
        ? raw.level
        : undefined,
    spokenLanguages: languages,
    otherLanguage: asString(raw.otherLanguage, 40),
    aceOnlineExperience: asString(raw.aceOnlineExperience, 2000),
    previousBrigade: asString(raw.previousBrigade, 80),
    playHours: isPlayHours(raw.playHours) ? raw.playHours : "",
    motivation: asString(raw.motivation, 2000),
    codeAccepted: raw.codeAccepted === true,
  };

  const step =
    typeof record.step === "number" &&
    record.step >= 0 &&
    record.step < applicationSteps.length
      ? record.step
      : 0;

  return { step, values };
}

export function readApplicationDraft(): ApplicationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(APPLICATION_DRAFT_KEY);
    if (!raw) return null;
    return sanitizeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeApplicationDraft(draft: ApplicationDraft) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(APPLICATION_DRAFT_KEY, JSON.stringify(draft));
}

export function stepId(index: number): ApplicationStepId {
  return applicationSteps[index] ?? "identity";
}
