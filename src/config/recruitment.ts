/**
 * Input bounds for the public application.
 * These are form constraints, not brigade admission rules.
 * Do not encode an unconfirmed minimum level or nation requirement here.
 */
export const gearIds = ["A", "B", "I", "M"] as const;
export type GearId = (typeof gearIds)[number];

export const spokenLanguageIds = ["en", "fr", "other"] as const;
export type SpokenLanguageId = (typeof spokenLanguageIds)[number];

export const playHoursIds = ["under1", "1to2", "2to4", "4to6", "6plus"] as const;
export type PlayHoursId = (typeof playHoursIds)[number];

export const recruitmentConfig = {
  nickname: { min: 2, max: 20 },
  discord: { min: 2, max: 32 },
  level: { min: 1, max: 999 },
  experience: { min: 10, max: 2000 },
  motivation: { max: 2000 },
  previousBrigade: { max: 80 },
  otherLanguage: { min: 2, max: 40 },
  gears: gearIds,
  spokenLanguages: spokenLanguageIds,
  playHours: playHoursIds,
} as const;

export const applicationSteps = ["identity", "experience", "motivation"] as const;
export type ApplicationStepId = (typeof applicationSteps)[number];

/** Public recruitment stance. Distinct from whether the form can be submitted. */
export const recruitmentOffer = {
  open: true,
  priorityGearId: "M",
  submissionEnabled: false,
} as const satisfies {
  open: boolean;
  priorityGearId: GearId;
  submissionEnabled: boolean;
};
