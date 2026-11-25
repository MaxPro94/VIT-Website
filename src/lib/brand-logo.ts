import { access } from "node:fs/promises";
import path from "node:path";
import { branding } from "@/config/branding";

export async function brandLogoExists() {
  try {
    await access(path.join(process.cwd(), "public", branding.logoFile));
    return true;
  } catch {
    return false;
  }
}
