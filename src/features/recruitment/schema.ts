import { z } from "zod";
import {
  gearIds,
  playHoursIds,
  recruitmentConfig,
  spokenLanguageIds,
} from "@/config/recruitment";

export type ValidationMessages = {
  nicknameLength: string;
  discordLength: string;
  discordFormat: string;
  gearRequired: string;
  levelRequired: string;
  levelInvalid: string;
  levelRange: string;
  languagesRequired: string;
  otherLanguageRequired: string;
  experienceLength: string;
  motivationLength: string;
  codeRequired: string;
  previousBrigadeLength: string;
  hoursRequired: string;
  otherLanguageLength: string;
};

function requireOtherLanguage(
  data: { spokenLanguages: readonly string[]; otherLanguage: string },
  ctx: {
    addIssue: (issue: { code: "custom"; path: string[]; message: string }) => void;
  },
  message: string,
) {
  if (
    data.spokenLanguages.includes("other") &&
    data.otherLanguage.trim().length < recruitmentConfig.otherLanguage.min
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["otherLanguage"],
      message,
    });
  }
}

export function createApplicationSchemas(messages: ValidationMessages) {
  const nickname = z
    .string()
    .trim()
    .min(recruitmentConfig.nickname.min, messages.nicknameLength)
    .max(recruitmentConfig.nickname.max, messages.nicknameLength);

  const discord = z
    .string()
    .trim()
    .min(recruitmentConfig.discord.min, messages.discordLength)
    .max(recruitmentConfig.discord.max, messages.discordLength)
    .refine((value) => !/\s/.test(value) && !value.startsWith("@"), {
      message: messages.discordFormat,
    });

  const gear = z.enum(gearIds, messages.gearRequired);
  const level = z
    .number(messages.levelRequired)
    .int(messages.levelInvalid)
    .min(recruitmentConfig.level.min, messages.levelRange)
    .max(recruitmentConfig.level.max, messages.levelRange);

  const languages = z
    .array(z.enum(spokenLanguageIds))
    .min(1, messages.languagesRequired);

  const otherLanguage = z
    .string()
    .trim()
    .max(recruitmentConfig.otherLanguage.max, messages.otherLanguageLength);

  const experience = z
    .string()
    .trim()
    .min(recruitmentConfig.experience.min, messages.experienceLength)
    .max(recruitmentConfig.experience.max, messages.experienceLength);

  const previousBrigade = z
    .string()
    .trim()
    .max(recruitmentConfig.previousBrigade.max, messages.previousBrigadeLength);

  const playHours = z.enum(playHoursIds, messages.hoursRequired);
  const motivation = z
    .string()
    .trim()
    .max(recruitmentConfig.motivation.max, messages.motivationLength);

  const codeAccepted = z.boolean().refine((value) => value, {
    message: messages.codeRequired,
  });

  const identity = z
    .object({
      osrNickname: nickname,
      discordUsername: discord,
      mainGear: gear,
      level,
      spokenLanguages: languages,
      otherLanguage,
    })
    .superRefine((data, ctx) => {
      requireOtherLanguage(data, ctx, messages.otherLanguageRequired);
    });

  const experienceStep = z.object({
    aceOnlineExperience: experience,
    previousBrigade,
    playHours,
  });

  const motivationStep = z.object({
    motivation,
    codeAccepted,
  });

  const full = z
    .object({
      osrNickname: nickname,
      discordUsername: discord,
      mainGear: gear,
      level,
      spokenLanguages: languages,
      otherLanguage,
      aceOnlineExperience: experience,
      previousBrigade,
      playHours,
      motivation,
      codeAccepted,
    })
    .superRefine((data, ctx) => {
      requireOtherLanguage(data, ctx, messages.otherLanguageRequired);
    });

  return {
    steps: [identity, experienceStep, motivationStep] as const,
    full,
  };
}

export type ApplicationSchemaValues = z.infer<
  ReturnType<typeof createApplicationSchemas>["full"]
>;
