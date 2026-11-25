import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { branding } from "@/config/branding";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageAlt = `${branding.acronym} emblem. ${branding.fullName}, ${branding.nation}, ${branding.server}.`;

export async function shareImage() {
  const logo = await readFile(join(process.cwd(), "public", branding.logoFile));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#0A0A0A",
          color: "#F2F0EB",
          padding: "72px 80px",
        }}
      >
        {/* ImageResponse renders its own image element. next/image is not available here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={280} height={280} alt="" />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 64 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: "#C9A227" }}>
            LOYAUTÉ · HONNEUR · EXCELLENCE
          </div>
          <div style={{ display: "flex", fontSize: 108, lineHeight: 1, marginTop: 18 }}>{branding.acronym}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#A0A0A0", marginTop: 16 }}>{branding.fullName}</div>
          <div style={{ display: "flex", fontSize: 24, color: "#A0A0A0", marginTop: 36 }}>
            {branding.nation} · {branding.server}
          </div>
        </div>
      </div>
    ),
    shareImageSize,
  );
}
