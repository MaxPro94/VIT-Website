"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";
import { gearIds, recruitmentConfig, spokenLanguageIds } from "@/config/recruitment";
import type { ApplicationFormValues } from "@/features/recruitment/draft";
import { Choice, FieldError, fieldClass } from "./field";

export function IdentityFields({
  form,
}: {
  form: UseFormReturn<ApplicationFormValues>;
}) {
  const t = useTranslations("apply");
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;
  const selected = watch("spokenLanguages");
  const showOther = selected.includes("other");

  return (
    <fieldset className="space-y-8">
      <legend className="font-display text-3xl tracking-tight">{t("steps.identity")}</legend>
      <div>
        <label htmlFor="osrNickname" className="block text-sm">
          {t("fields.osrNickname.label")}
        </label>
        <p id="osrNickname-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.osrNickname.hint")}
        </p>
        <input
          id="osrNickname"
          className={fieldClass}
          autoComplete="off"
          spellCheck={false}
          aria-required="true"
          aria-invalid={Boolean(errors.osrNickname)}
          aria-describedby={`osrNickname-hint${errors.osrNickname ? " osrNickname-error" : ""}`}
          {...register("osrNickname")}
        />
        <FieldError id="osrNickname-error" message={errors.osrNickname?.message} />
      </div>
      <div>
        <label htmlFor="discordUsername" className="block text-sm">
          {t("fields.discordUsername.label")}
        </label>
        <p id="discordUsername-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.discordUsername.hint")}
        </p>
        <input
          id="discordUsername"
          className={fieldClass}
          autoComplete="off"
          spellCheck={false}
          aria-required="true"
          aria-invalid={Boolean(errors.discordUsername)}
          aria-describedby={`discordUsername-hint${errors.discordUsername ? " discordUsername-error" : ""}`}
          {...register("discordUsername")}
        />
        <FieldError id="discordUsername-error" message={errors.discordUsername?.message} />
      </div>
      <fieldset>
        <legend className="text-sm">{t("fields.mainGear.label")}</legend>
        <p id="mainGear-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.mainGear.hint")}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-describedby="mainGear-hint">
          {gearIds.map((gear) => (
            <Choice key={gear} type="radio" value={gear} {...register("mainGear")}>
              {t(`gears.${gear}`)}
            </Choice>
          ))}
        </div>
        <FieldError id="mainGear-error" message={errors.mainGear?.message} />
      </fieldset>
      <div>
        <label htmlFor="level" className="block text-sm">
          {t("fields.level.label")}
        </label>
        <p id="level-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.level.hint")}
        </p>
        <input
          id="level"
          type="number"
          inputMode="numeric"
          min={recruitmentConfig.level.min}
          max={recruitmentConfig.level.max}
          className={fieldClass}
          aria-required="true"
          aria-invalid={Boolean(errors.level)}
          aria-describedby={`level-hint${errors.level ? " level-error" : ""}`}
          {...register("level", {
            setValueAs: (value) => (value === "" || value === null ? undefined : Number(value)),
          })}
        />
        <FieldError id="level-error" message={errors.level?.message} />
      </div>
      <fieldset>
        <legend className="text-sm">{t("fields.spokenLanguages.label")}</legend>
        <p id="languages-hint" className="mt-1 text-sm text-muted">
          {t("required")}. {t("fields.spokenLanguages.hint")}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {spokenLanguageIds.map((language) => (
            <Choice
              key={language}
              type="checkbox"
              checked={selected.includes(language)}
              onChange={(event) => {
                const next = event.target.checked
                  ? [...selected, language]
                  : selected.filter((item) => item !== language);
                setValue("spokenLanguages", next, { shouldDirty: true, shouldValidate: true });
              }}
            >
              {t(`languages.${language}`)}
            </Choice>
          ))}
        </div>
        <FieldError id="languages-error" message={errors.spokenLanguages?.message} />
      </fieldset>
      {showOther ? (
        <div>
          <label htmlFor="otherLanguage" className="block text-sm">
            {t("fields.otherLanguage.label")}
          </label>
          <p id="otherLanguage-hint" className="mt-1 text-sm text-muted">
            {t("fields.otherLanguage.hint")}
          </p>
          <input
            id="otherLanguage"
            className={fieldClass}
            aria-required="true"
            aria-invalid={Boolean(errors.otherLanguage)}
            aria-describedby={`otherLanguage-hint${errors.otherLanguage ? " otherLanguage-error" : ""}`}
            {...register("otherLanguage")}
          />
          <FieldError id="otherLanguage-error" message={errors.otherLanguage?.message} />
        </div>
      ) : null}
    </fieldset>
  );
}
