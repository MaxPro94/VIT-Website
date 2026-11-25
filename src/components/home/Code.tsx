"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { featuredValueIds, homeSectionIds } from "@/config/branding";
import { gsap, readStoryMode, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Container } from "@/components/ui/Container";

export function Code() {
  const t = useTranslations("code");
  const root = useRef<HTMLElement>(null);
  const [layoutEpoch, setLayoutEpoch] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 768px)");
    const onChange = () => setLayoutEpoch((value) => value + 1);
    reduced.addEventListener("change", onChange);
    wide.addEventListener("change", onChange);
    return () => {
      reduced.removeEventListener("change", onChange);
      wide.removeEventListener("change", onChange);
    };
  }, []);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === section || trigger.pin === section) trigger.kill();
      });
      const spacer = section.parentElement;
      if (spacer?.classList.contains("pin-spacer")) {
        spacer.parentElement?.insertBefore(section, spacer);
        spacer.remove();
      }
      gsap.set(section, { clearProps: "transform,top,left,width,height,maxWidth,maxHeight,margin,padding,position,boxSizing" });
      const mode = readStoryMode();
      const panels = gsap.utils.toArray<HTMLElement>(".value-panel", section);
      if (panels.length < 2 || mode === "reduced") {
        delete section.dataset.story;
        gsap.set(".value-mask, .value-ghost, .value-progress", { clearProps: "all" });
        return;
      }

      const mask = (panel: HTMLElement) => panel.querySelector<HTMLElement>(".value-mask");
      const ghost = (panel: HTMLElement) => panel.querySelector<HTMLElement>(".value-ghost");
      const progress = section.querySelector<HTMLElement>(".value-progress");

      if (mode === "stack") {
        gsap.set(progress, { scaleX: 0.08, transformOrigin: "left center" });
        panels.forEach((panel) => {
          const panelMask = mask(panel);
          const panelGhost = ghost(panel);
          if (panelMask) {
            gsap.set(panelMask, { autoAlpha: 0, y: 28 });
            gsap.to(panelMask, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: panel, start: "top 88%" },
            });
          }
          if (panelGhost) {
            gsap.set(panelGhost, { autoAlpha: 0 });
            gsap.to(panelGhost, {
              autoAlpha: 1,
              duration: 0.6,
              scrollTrigger: { trigger: panel, start: "top 88%" },
            });
          }
        });
        ScrollTrigger.create({
          trigger: section,
          start: "top 75%",
          end: "bottom 55%",
          scrub: 0.35,
          onUpdate: (self) => {
            gsap.set(progress, { scaleX: Math.max(0.08, self.progress) });
          },
        });
        return;
      }

      section.dataset.story = "on";
      const list = section.querySelector<HTMLElement>(".value-list");
      const masks = panels.map((panel) => mask(panel)).filter((item): item is HTMLElement => item !== null);
      const travel = (item: HTMLElement) => item.parentElement?.offsetHeight || item.offsetHeight;
      const fit = () => {
        if (!list) return;
        list.style.minHeight = "0px";
        const height = Math.max(...masks.map((item) => item.offsetHeight));
        if (height > 0) list.style.minHeight = `${height}px`;
      };
      fit();

      gsap.set(masks, { autoAlpha: 0, y: (_index, item) => travel(item as HTMLElement) });
      gsap.set(masks[0], { autoAlpha: 1, y: 0 });
      gsap.set(".value-ghost", { autoAlpha: 0 });
      gsap.set(ghost(panels[0]), { autoAlpha: 1 });
      gsap.set(progress, { scaleX: 1 / panels.length, transformOrigin: "left center" });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.45,
        },
      });

      panels.forEach((panel, index) => {
        if (index === 0 || !masks[index] || !masks[index - 1]) return;
        timeline
          .to({}, { duration: 0.7 })
          .to(masks[index - 1], { y: () => -travel(masks[index - 1]), autoAlpha: 0, duration: 0.4 })
          .to(ghost(panels[index - 1]), { autoAlpha: 0, duration: 0.2 }, "<")
          .to(masks[index], { y: 0, autoAlpha: 1, duration: 0.42 }, "<0.14")
          .to(ghost(panel), { autoAlpha: 1, duration: 0.28 }, "<")
          .to(progress, { scaleX: (index + 1) / panels.length, duration: 0.42, ease: "none" }, "<");
      });

      const onResize = () => fit();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        delete section.dataset.story;
        if (list) list.style.minHeight = "";
      };
    },
    { scope: root, dependencies: [layoutEpoch] },
  );

  return (
    <section ref={root} id={homeSectionIds.values} className="values-stage scroll-mt-24 bg-background-secondary">
      <Container className="values-pin py-16 md:py-20">
        <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
          {t("index")} — {t("eyebrow")}
        </p>
        <h2 className="mt-4 max-w-xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-[0.96] tracking-[-0.04em]">
          {t("title")}
        </h2>
        <ol className="value-list mt-8">
          {featuredValueIds.map((id, index) => (
              <li key={id} className="value-panel relative border-t border-line py-6">
              <p
                aria-hidden
                className="value-ghost pointer-events-none absolute -top-3 left-0 font-display text-[clamp(4.5rem,12vw,8rem)] leading-none tracking-[-0.06em] text-foreground/5"
              >
                {t(`values.${id}.name`)}
              </p>
              <div className="value-mask relative">
                <p className="font-ornament text-xs tracking-[0.2em] text-gold">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-display text-[clamp(2.4rem,5vw,4.4rem)] leading-none tracking-[-0.04em]">
                  {t(`values.${id}.name`)}
                </h3>
                <p className="mt-3 max-w-xl text-base leading-7 text-muted">{t(`values.${id}.text`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 h-px bg-line" aria-hidden>
          <div className="value-progress h-px origin-left bg-gold" />
        </div>
      </Container>
    </section>
  );
}
