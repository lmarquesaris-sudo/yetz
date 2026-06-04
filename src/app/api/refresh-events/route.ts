/**
 * Cron endpoint to refresh events from Barcelona Open Data API.
 * Called daily by Vercel Cron at 6:00 AM.
 *
 * This triggers a revalidation of the events data.
 * The actual fetch happens at build time via fetch-events.mjs,
 * but this endpoint ensures the /api/events cache is also fresh.
 */

import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  // Verify this is called by Vercel Cron (or in development)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Trigger a rebuild by calling the Vercel Deploy Hook if configured
    const deployHook = process.env.VERCEL_DEPLOY_HOOK;
    if (deployHook) {
      await fetch(deployHook, { method: "POST" });
      return NextResponse.json({
        ok: true,
        message: "Deploy triggered — events will refresh on rebuild",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      ok: true,
      message: "No deploy hook configured. Events refresh on next deploy.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[refresh-events] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to refresh events" },
      { status: 500 }
    );
  }
}
