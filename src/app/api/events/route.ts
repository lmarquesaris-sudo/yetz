import { NextResponse } from "next/server";
import { fetchArtEvents } from "@/lib/api";
import { events as fallbackEvents } from "@/lib/data";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const artEvents = await fetchArtEvents();

    if (artEvents.length === 0) {
      // If API returns nothing, use fallback data
      return NextResponse.json(fallbackEvents);
    }

    return NextResponse.json(artEvents);
  } catch (error) {
    console.error("Error fetching events from Barcelona API:", error);
    // Fallback to hardcoded data if API fails
    return NextResponse.json(fallbackEvents);
  }
}
