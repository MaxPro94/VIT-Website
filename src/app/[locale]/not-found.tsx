import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="px-6 pt-40 pb-28">
      <h1 className="font-display text-4xl tracking-tight md:text-6xl">{t("title")}</h1>
      <Link href="/" className="mt-8 inline-flex text-[0.72rem] tracking-[0.2em] text-gold uppercase">
        {t("home")}
      </Link>
    </div>
  );
}
