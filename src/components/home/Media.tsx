import { getTranslations } from "next-intl/server";
import { homeSectionIds } from "@/config/branding";
import { socialConfig } from "@/config/social";
import { publishedVideos, safeHttpsUrl } from "@/lib/external";
import { Reveal } from "@/components/animations/Reveal";
import { Container } from "@/components/ui/Container";
import { MediaReel } from "./MediaReel";

export async function Media() {
  const t = await getTranslations("media");
  const videos = publishedVideos(socialConfig.youtubeVideos);
  const channel = safeHttpsUrl(socialConfig.youtubeChannelUrl);

  if (videos.length === 0) {
    return (
      <section id={homeSectionIds.media} className="scroll-mt-24 py-24 md:py-36">
        <Container>
          <Reveal>
            <p className="font-ornament text-xs tracking-[0.28em] text-gold uppercase">
              {t("index")} — {t("eyebrow")}
            </p>
            <h2 className="mt-6 font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] tracking-[-0.04em]">
              {t("title")}
            </h2>
          </Reveal>
          <p className="mt-12 max-w-xl text-lg leading-8 text-muted">{t("empty")}</p>
        </Container>
      </section>
    );
  }

  return (
    <MediaReel
      videos={videos}
      channel={channel}
      channelName={socialConfig.youtubeChannelName}
    />
  );
}
