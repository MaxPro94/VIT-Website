"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm, type FieldPath } from "react-hook-form";
import { applicationSteps, recruitmentConfig, recruitmentOffer } from "@/config/recruitment";
import {
  emptyApplication,
  readApplicationDraft,
  writeApplicationDraft,
  type ApplicationFormValues,
} from "@/features/recruitment/draft";
import { toApplicationPayload } from "@/features/recruitment/payload";
import { createApplicationSchemas } from "@/features/recruitment/schema";
import { submitApplication } from "@/features/recruitment/submit";
import type { ApplicationSubmissionResult } from "@/features/recruitment/types";
import { isLocale } from "@/i18n/routing";
import { buttonClass } from "@/components/ui/button-styles";
import { ExperienceFields } from "./ExperienceFields";
import { IdentityFields } from "./IdentityFields";
import { MotivationFields } from "./MotivationFields";

export function ApplicationForm() {
  const t = useTranslations("apply");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ApplicationSubmissionResult | null>(null);
  const [ready, setReady] = useState(false);

  const messages = useMemo(
    () => ({
      nicknameLength: t("validation.nicknameLength", recruitmentConfig.nickname),
      discordLength: t("validation.discordLength", recruitmentConfig.discord),
      discordFormat: t("validation.discordFormat"),
      gearRequired: t("validation.gearRequired"),
      levelRequired: t("validation.levelRequired"),
      levelInvalid: t("validation.levelInvalid"),
      levelRange: t("validation.levelRange", recruitmentConfig.level),
      languagesRequired: t("validation.languagesRequired"),
      otherLanguageRequired: t("validation.otherLanguageRequired"),
      otherLanguageLength: t("validation.otherLanguageLength", {
        max: recruitmentConfig.otherLanguage.max,
      }),
      experienceLength: t("validation.experienceLength", recruitmentConfig.experience),
      motivationLength: t("validation.motivationLength", {
        max: recruitmentConfig.motivation.max,
      }),
      codeRequired: t("validation.codeRequired"),
      previousBrigadeLength: t("validation.previousBrigadeLength", {
        max: recruitmentConfig.previousBrigade.max,
      }),
      hoursRequired: t("validation.hoursRequired"),
    }),
    [t],
  );

  const schemas = useMemo(() => createApplicationSchemas(messages), [messages]);
  const form = useForm<ApplicationFormValues>({
    defaultValues: emptyApplication,
    mode: "onBlur",
  });
  const { handleSubmit, getValues, setError, clearErrors, reset, watch, setFocus } = form;

  useEffect(() => {
    const draft = readApplicationDraft();
    if (draft) {
      reset(draft.values);
      setStep(draft.step);
    }
    setReady(true);
  }, [reset]);

  useEffect(() => {
    if (!ready) return;
    const subscription = watch(() => {
      writeApplicationDraft({ step, values: getValues() });
    });
    return () => subscription.unsubscribe();
  }, [ready, step, watch, getValues]);

  useEffect(() => {
    if (!ready) return;
    writeApplicationDraft({ step, values: getValues() });
  }, [ready, step, getValues]);

  function showIssues(issues: { path: PropertyKey[]; message: string }[]) {
    clearErrors();
    const names: FieldPath<ApplicationFormValues>[] = [];
    for (const issue of issues) {
      const name = issue.path[0];
      if (typeof name !== "string") continue;
      setError(name as FieldPath<ApplicationFormValues>, { message: issue.message });
      names.push(name as FieldPath<ApplicationFormValues>);
    }
    if (names[0]) setFocus(names[0]);
  }

  function continueStep() {
    const parsed = schemas.steps[step].safeParse(getValues());
    if (!parsed.success) {
      showIssues(parsed.error.issues);
      return;
    }
    setResult(null);
    clearErrors();
    setStep((current) => Math.min(current + 1, applicationSteps.length - 1));
  }

  async function transmit() {
    const parsed = schemas.full.safeParse(getValues());
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.path[0];
      const stepIndex = applicationSteps.findIndex((_, index) =>
        schemas.steps[index].safeParse(getValues()).success === false,
      );
      if (stepIndex >= 0) setStep(stepIndex);
      showIssues(parsed.error.issues);
      if (typeof first === "string") {
        window.setTimeout(() => setFocus(first as FieldPath<ApplicationFormValues>), 0);
      }
      return;
    }
    if (!isLocale(locale)) return;
    setPending(true);
    setResult(null);
    try {
      const payload = toApplicationPayload(parsed.data, locale);
      const response = await submitApplication(payload);
      setResult(response);
    } catch {
      setResult({ status: "error" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      noValidate
      className="mt-12"
      onSubmit={handleSubmit(() => {
        if (step < applicationSteps.length - 1) continueStep();
        else if (recruitmentOffer.submissionEnabled) void transmit();
      })}
    >
      <p className="text-[0.72rem] tracking-[0.18em] text-muted uppercase">
        {t("stepLabel", { current: step + 1, total: applicationSteps.length })}
      </p>
      <div className="mt-4 h-px bg-line" aria-hidden>
        <div
          className="h-px bg-gold transition-[width] duration-500"
          style={{ width: `${((step + 1) / applicationSteps.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-3">
        {applicationSteps.map((id, index) => {
          const current = index === step;
          return (
            <li key={id}>
              <button
                type="button"
                className={`w-full border-t pt-3 text-left text-sm ${current ? "border-gold text-foreground" : "border-line text-muted"}`}
                aria-current={current ? "step" : undefined}
                onClick={() => {
                  if (index < step) setStep(index);
                }}
                disabled={index > step}
              >
                0{index + 1} {t(`steps.${id}`)}
              </button>
            </li>
          );
        })}
      </ol>

      <div key={step} className="media-rise mt-8 border border-line bg-background-secondary/70 p-5 md:p-8" aria-live="polite">
        <p className="mb-8 max-w-xl text-base leading-7 text-muted">
          {t(`stepLeads.${applicationSteps[step] ?? "identity"}`)}
        </p>
        {step === 0 ? <IdentityFields form={form} /> : null}
        {step === 1 ? <ExperienceFields form={form} /> : null}
        {step === 2 ? <MotivationFields form={form} /> : null}
      </div>

      {result ? (
        <p role="status" className="mt-8 max-w-xl border-l border-gold pl-4 text-sm leading-6 text-foreground">
          {t(`result.${result.status}`)}
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-4">
        {step > 0 ? (
          <button type="button" className={buttonClass("line")} onClick={() => setStep((current) => current - 1)}>
            {t("actions.back")}
          </button>
        ) : null}
        {step < applicationSteps.length - 1 ? (
          <button type="submit" className={buttonClass("gold")}>
            {step === applicationSteps.length - 2 ? t("actions.review") : t("actions.next")}
          </button>
        ) : recruitmentOffer.submissionEnabled ? (
          <button type="submit" className={buttonClass("gold")} disabled={pending}>
            {pending ? t("actions.working") : t("actions.transmit")}
          </button>
        ) : (
          <button type="button" className={buttonClass("gold", "cursor-not-allowed opacity-45")} disabled>
            {t("actions.unavailable")}
          </button>
        )}
      </div>
    </form>
  );
}
