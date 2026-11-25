import { getBrigadeStatistics } from "@/features/statistics/provider";
import { brandLogoExists } from "@/lib/brand-logo";
import { Brotherhood } from "@/components/home/Brotherhood";
import { Code } from "@/components/home/Code";
import { Hero } from "@/components/home/Hero";
import { Media } from "@/components/home/Media";
import { Officers } from "@/components/home/Officers";
import { RecruitmentCta } from "@/components/home/RecruitmentCta";
import { Statistics } from "@/components/home/Statistics";

export default async function HomePage() {
  const [hasLogo, statistics] = await Promise.all([brandLogoExists(), getBrigadeStatistics()]);

  return (
    <>
      <Hero hasLogo={hasLogo} />
      <Statistics view={statistics} />
      <Brotherhood />
      <Code />
      <Officers />
      <Media />
      <RecruitmentCta />
    </>
  );
}
