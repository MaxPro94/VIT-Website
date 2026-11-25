import type { ApplicationPayload, ApplicationSubmissionResult } from "./types";

/**
 * Single integration point for a future backend or Discord delivery.
 * V1 is not connected. This function must not report a successful delivery.
 */
export async function submitApplication(
  payload: ApplicationPayload,
): Promise<ApplicationSubmissionResult> {
  void payload;
  return { status: "not_connected" };
}
