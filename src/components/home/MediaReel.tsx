"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { homeSectionIds } from "@/config/branding";
import type { PublicVideo } from "@/lib/external";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, prefersSimpleMotion, useGSAP } from "@/lib/gsap";
import { buttonClass } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";

const ROTATION_MS = 40000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function ambientSrc(id: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    loop: "1",
    playlist: id,
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
    disablekb: "1",
    fs: "0",
    iv_load_policy: "3",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function playerSrc(id: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function watchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

function FilmStill({ id, className }: { id: string; className?: string }) {
  const [src, setSrc] = useState(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={className}
      onLoad={(event) => {
        if (event.currentTarget.naturalWidth < 400) {
          setSrc(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        }
      }}
      onError={() => {
        setSrc((current) =>
          current.includes("hqdefault") ? current : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        );
      }}
    />
  );
}

export function MediaReel({
  videos,
  channel,
  channelName,
}: {
  videos: readonly PublicVideo[];
  channel: string | null;
  channelName?: string;
}) {
  const t = useTranslations("media");
  const root = useRef<HTMLElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [ambient, setAmbient] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const count = videos.length;
  const featured = videos[index] ?? videos[0];
  const latest = videos[0];

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      setInView(visible);
      if (!visible) {
        setAmbient(false);
        setPlaying(false);
        return;
      }
      if (!prefersReducedMotion()) setAmbient(true);
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || held || playing || count < 2) return;
    if (prefersReducedMotion()) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [count, held, inView, index, paused, playing]);

  useEffect(() => {
    const scroller = strip.current;
    const tab = tabs.current[index];
    if (!scroller || !tab) return;
    const left = tab.offsetLeft - (scroller.clientWidth - tab.clientWidth) / 2;
    scroller.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [index]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const simple = prefersSimpleMotion();
      gsap.from(".media-copy", {
        autoAlpha: 0,
        y: simple ? 16 : 28,
        duration: simple ? 0.6 : 0.8,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: root.current, start: "top 86%" },
      });
      gsap.to(".media-still", {
        scale: simple ? 1.05 : 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: root },
  );

  if (!featured || !latest) return null;

  function select(next: number, moveFocus = false) {
    setIndex((next + count) % count);
    if (moveFocus) tabs.current[(next + count) % count]?.focus();
  }

  const showAmbient = ambient && inView && !playing;

  return (
    <section
      ref={root}
      id={homeSectionIds.media}
      className="relative isolate h-dvh overflow-hidden"
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setPaused(false);
      }}
    >
        <div className="absolute inset-0 bg-background">
        <div className="media-still absolute inset-0">
          <FilmStill key={featured.id} id={featured.id} className="media-fade h-full w-full object-cover" />
        </div>
        {showAmbient ? (
          <div
            className={cn(
              "media-ambient transition-opacity duration-700",
              index === 0 ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          >
            <iframe
              src={ambientSrc(latest.id)}
              title={latest.title}
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-background via-background/75 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[min(100%,46rem)] bg-gradient-to-r from-background via-background/75 to-transparent md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-52 bg-gradient-to-t from-background via-background/80 to-transparent md:block" />
      </div>

      <Container className="relative flex h-full flex-col justify-end pt-24 pb-6 md:pb-8">
        <div className="media-copy max-w-xl">
          <div className="flex items-center gap-5">
            <p className="font-ornament text-xs tracking-[0.28em] text-gold">
              <span className="sr-only">
                {t("position", { current: index + 1, total: count })}
              </span>
              <span aria-hidden>
                {pad(index + 1)} / {pad(count)}
              </span>
            </p>
            <button
              type="button"
              className="text-[0.72rem] tracking-[0.18em] text-muted uppercase hover:text-foreground"
              aria-pressed={held}
              onClick={() => setHeld((value) => !value)}
            >
              {held ? t("resume") : t("pause")}
            </button>
          </div>
          <h2 className="mt-4 font-display text-lg leading-none tracking-[-0.03em]">{t("title")}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">{t("lead")}</p>
          <p key={featured.id} className="media-rise mt-3 font-display text-[clamp(1.45rem,2.6vw,2.2rem)] leading-none tracking-[-0.03em]">
            <a
              href={watchUrl(featured.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold-light"
            >
              {featured.title}
              <span className="sr-only"> — {t("onYoutube")}</span>
            </a>
          </p>
          {channelName ? (
            <p className="mt-3 text-sm text-muted">{t("byline", { name: channelName })}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {channel ? (
              <a
                href={channel}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("gold")}
              >
                {t("channel")}
              </a>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 px-3 text-[0.72rem] tracking-[0.18em] text-muted uppercase hover:text-foreground"
              onClick={() => setPlaying(true)}
              aria-label={t("watch", { title: featured.title })}
            >
              <Play aria-hidden size={14} strokeWidth={1.5} />
              {t("playHere")}
            </button>
          </div>
          <span className="mt-6 block h-px w-28 bg-white/15" aria-hidden>
            <span
              key={paused || held || playing ? `hold-${index}` : index}
              className={cn(
                "block h-full origin-left bg-gold",
                paused || held || playing ? "scale-x-0" : "media-progress",
              )}
              style={{ animationDuration: `${ROTATION_MS}ms` }}
            />
          </span>
        </div>

        <div
          className="mt-6 flex items-center gap-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("films")}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              select(index + 1, true);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              select(index - 1, true);
            }
          }}
        >
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line text-foreground hover:border-gold"
            aria-label={t("previous")}
            onClick={() => select(index - 1)}
          >
            <ChevronLeft aria-hidden size={18} strokeWidth={1.5} />
          </button>
          <div
            ref={strip}
            role="tablist"
            aria-label={t("films")}
            className="media-strip flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {videos.map((video, item) => {
              const selected = item === index;
              return (
                <button
                  key={video.id}
                  ref={(node) => {
                    tabs.current[item] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`media-tab-${video.id}`}
                  aria-selected={selected}
                  aria-controls="media-feature"
                  tabIndex={selected ? 0 : -1}
                  className="group w-24 shrink-0 text-left sm:w-36"
                  onClick={() => select(item)}
                >
                  <span
                    className={cn(
                      "relative block aspect-video overflow-hidden border transition-[border-color,transform] duration-500",
                      selected ? "border-gold" : "border-line motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-gold/70",
                    )}
                  >
                    <FilmStill
                      id={video.id}
                      className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                    />
                  </span>
                  <span className={cn("mt-2 block truncate text-xs tracking-wide", selected ? "text-foreground" : "sr-only")}>
                    {video.title}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-line text-foreground hover:border-gold"
            aria-label={t("next")}
            onClick={() => select(index + 1)}
          >
            <ChevronRight aria-hidden size={18} strokeWidth={1.5} />
          </button>
        </div>
      </Container>

      {playing ? (
        <div className="absolute inset-0 z-10 flex items-center bg-background/88 px-6 py-24 md:px-16">
          <button
            type="button"
            className="absolute top-24 right-6 inline-flex min-h-11 items-center gap-2 border border-line px-4 text-[0.72rem] tracking-[0.18em] text-foreground uppercase hover:border-gold md:right-10"
            onClick={() => setPlaying(false)}
          >
            <X aria-hidden size={14} strokeWidth={1.5} />
            {t("closePlayer")}
          </button>
          <iframe
            className="mx-auto aspect-video w-full max-w-5xl bg-background"
            src={playerSrc(featured.id)}
            title={t("playerTitle", { title: featured.title })}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}
      <p id="media-feature" className="sr-only">
        {featured.title}
      </p>
    </section>
  );
}
