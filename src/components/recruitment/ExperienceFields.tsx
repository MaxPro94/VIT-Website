"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { playHoursIds } from "@/config/recruitment";
import type { ApplicationFormValues } from "@/features/recruitment/draft";
import { Choice, FieldError, fieldClass } from "./field";

export function ExperienceFields({
  form,
}: {
  form: UseFormReturn<ApplicationFormValues>;
}) {
  const t = useTranslations("apply");
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <fieldset className="space-y-8">
      <legend className="font-display text-3xl tracking-tight">{t("steps.experience")}</legend>
      <div>
        <label htmlFor="aceOnlineExperience" className="block text-sm">
          {t("fields.aceOnlineExperience.label")}
        </label>
        <p id="experience-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.aceOnlineExperience.hint")}
        </p>
        <textarea
          id="aceOnlineExperience"
          rows={5}
          className={fieldClass}
          aria-required="true"
          aria-invalid={Boolean(errors.aceOnlineExperience)}
          aria-describedby={`experience-hint${errors.aceOnlineExperience ? " experience-error" : ""}`}
          {...register("aceOnlineExperience")}
        />
        <FieldError id="experience-error" message={errors.aceOnlineExperience?.message} />
      </div>
      <div>
        <label htmlFor="previousBrigade" className="block text-sm">
          {t("fields.previousBrigade.label")}
        </label>
        <p id="previous-hint" className="mt-1 text-sm text-muted">
          {t("fields.previousBrigade.hint")}
        </p>
        <input
          id="previousBrigade"
          className={fieldClass}
          aria-describedby="previous-hint"
          {...register("previousBrigade")}
        />
        <FieldError id="previous-error" message={errors.previousBrigade?.message} />
      </div>
      <fieldset>
        <legend className="text-sm">{t("fields.playHours.label")}</legend>
        <p id="hours-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.playHours.hint")}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="radiogroup" aria-describedby="hours-hint">
          {playHoursIds.map((option) => (
            <Choice key={option} type="radio" value={option} {...register("playHours")}>
              {t(`hours.${option}`)}
            </Choice>
          ))}
        </div>
        <FieldError id="hours-error" message={errors.playHours?.message} />
      </fieldset>
    </fieldset>
  );
}
