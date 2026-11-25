"use client";

import type { UseFormReturn } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { valueIds } from "@/config/branding";
import { gearIds, playHoursIds, spokenLanguageIds } from "@/config/recruitment";
import type { ApplicationFormValues } from "@/features/recruitment/draft";
import { FieldError, fieldClass } from "./field";

function isGear(value: string): value is (typeof gearIds)[number] {
  return gearIds.some((gear) => gear === value);
}

function isPlayHours(value: string): value is (typeof playHoursIds)[number] {
  return playHoursIds.some((option) => option === value);
}

export function MotivationFields({
  form,
}: {
  form: UseFormReturn<ApplicationFormValues>;
}) {
  const t = useTranslations("apply");
  const code = useTranslations("code");
  const locale = useLocale();
  const {
    register,
    watch,
    formState: { errors },
  } = form;
  const values = watch();
  const formatter = new Intl.NumberFormat(locale);

  const languages = values.spokenLanguages
    .filter((language) => spokenLanguageIds.some((item) => item === language))
    .map((language) =>
      language === "other" && values.otherLanguage.trim()
        ? `${t("languages.other")} (${values.otherLanguage.trim()})`
        : t(`languages.${language}`),
    )
    .join(", ");

  return (
    <div className="space-y-10">
      <fieldset className="space-y-8">
        <legend className="font-display text-3xl tracking-tight">{t("steps.motivation")}</legend>
        <div>
          <label htmlFor="motivation" className="block text-sm">
            {t("fields.motivation.label")}
          </label>
          <p id="motivation-hint" className="mt-1 text-sm text-muted">
            {t("optional")}. {t("fields.motivation.hint")}
          </p>
          <textarea
            id="motivation"
            rows={5}
            className={fieldClass}
            placeholder={t("fields.motivation.placeholder")}
            aria-required="false"
            aria-invalid={Boolean(errors.motivation)}
            aria-describedby={`motivation-hint${errors.motivation ? " motivation-error" : ""}`}
            {...register("motivation")}
          />
          <FieldError id="motivation-error" message={errors.motivation?.message} />
        </div>
        <div>
          <h3 className="font-display text-2xl tracking-tight">{t("fields.codeAccepted.heading")}</h3>
          {t("fields.codeAccepted.intro") ? (
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{t("fields.codeAccepted.intro")}</p>
          ) : null}
          <ol className="mt-5">
            {valueIds.map((id, index) => (
              <li
                key={id}
                className="code-point grid grid-cols-[2.25rem_1fr] gap-3 border-t border-line py-3"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <span className="font-ornament text-xs tracking-[0.16em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block font-display text-lg leading-none tracking-tight">
                    {code(`values.${id}.name`)}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{code(`values.${id}.principle`)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <label className="flex min-h-11 items-start gap-3 text-sm leading-6">
            <input
              type="checkbox"
              className="mt-1"
              aria-invalid={Boolean(errors.codeAccepted)}
              aria-describedby={errors.codeAccepted ? "code-error" : undefined}
              {...register("codeAccepted")}
            />
            <span>{t("fields.codeAccepted.label")}</span>
          </label>
          <FieldError id="code-error" message={errors.codeAccepted?.message} />
        </div>
      </fieldset>
      <section aria-labelledby="summary-title" className="border-t border-line pt-8">
        <h2 id="summary-title" className="font-display text-2xl tracking-tight">
          {t("summary.title")}
        </h2>
        <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
          <SummaryItem label={t("fields.osrNickname.label")} value={values.osrNickname} empty={t("summary.empty")} />
          <SummaryItem label={t("fields.discordUsername.label")} value={values.discordUsername} empty={t("summary.empty")} />
          <SummaryItem
            label={t("fields.mainGear.label")}
            value={isGear(values.mainGear) ? t(`gears.${values.mainGear}`) : ""}
            empty={t("summary.empty")}
          />
          <SummaryItem
            label={t("fields.level.label")}
            value={typeof values.level === "number" && Number.isFinite(values.level) ? formatter.format(values.level) : ""}
            empty={t("summary.empty")}
          />
          <SummaryItem label={t("fields.spokenLanguages.label")} value={languages} empty={t("summary.empty")} />
          <SummaryItem label={t("fields.previousBrigade.label")} value={values.previousBrigade} empty={t("summary.empty")} />
          <SummaryItem
            label={t("fields.playHours.label")}
            value={isPlayHours(values.playHours) ? t(`hours.${values.playHours}`) : ""}
            empty={t("summary.empty")}
          />
          <SummaryItem label={t("fields.codeAccepted.label")} value={values.codeAccepted ? t("summary.accepted") : t("summary.notAccepted")} empty={t("summary.empty")} />
        </dl>
        <p className="mt-6 text-sm leading-6 text-muted">{values.motivation || t("summary.empty")}</p>
      </section>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  empty,
}: {
  label: string;
  value: string;
  empty: string;
}) {
  const text = value.trim();
  return (
    <div className="border-b border-line pb-3">
      <dt className="text-[0.72rem] tracking-[0.16em] text-muted uppercase">{label}</dt>
      <dd className="mt-2 text-foreground">{text || empty}</dd>
    </div>
  );
}
