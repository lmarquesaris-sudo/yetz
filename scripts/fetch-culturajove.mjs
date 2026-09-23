/**
 * Yetz — Scraper de CulturaJove.cat (teatro joven en Barcelona)
 * Fuente secundaria: teatro alternativo a precios jóvenes.
 *
 * Run: node scripts/fetch-culturajove.mjs
 * Output: public/culturajove-events.json
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE_URL = "https://www.culturajove.cat/cat/";
const DETAIL_BASE = "https://www.culturajove.cat";
const MAX_PAGES = 10; // Don't scrape all 32 pages, top 10 is enough

// Only keep events in Barcelona city
const BCN_KEYWORDS = [
  "barcelona", "bcn",
];

// Venues we know are in Barcelona even if city isn't explicit
const BCN_VENUES = [
  "sala fènix", "sala fenix", "teatreneu", "teatre condal", "teatre lliure",
  "sala beckett", "teatre romea", "teatre poliorama", "antic teatre",
  "sala flyhard", "versus teatre", "teatre gaudí", "teatre gaudi",
  "la villarroel", "sala hiroshima", "teatre nacional", "mercat de les flors",
  "teatre victòria", "teatre victoria", "teatre apolo", "el molino",
  "sat!", "almeria teatre", "teatre tantarantana", "la seca",
  "espai brossa", "dau al sec", "sala atrium", "espai texas",
  "teatre eòlia", "teatre eolia", "teatre akadèmia", "teatre akademia",
  "sala barts", "teatre barts", "sala planeta",
  "centre artesà tradicionàrius", "nau ivanow",
  "la perla 29", "sala muntaner", "teatre principal",
];

function isBarcelona(venue, city) {
  const lower = (venue + " " + city).toLowerCase();
  if (BCN_KEYWORDS.some(kw => lower.includes(kw))) return true;
  if (BCN_VENUES.some(v => lower.includes(v))) return true;
  return false;
}

/** Parse date string like "26/09/2026" to "2026-09-26" */
function parseDate(dateStr) {
  if (!dateStr) return "";
  const match = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/** Parse price string like "12,00 €" or "12,00 € - 15,00 €" */
function parsePrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.match(/(\d+)[,.](\d+)\s*€/);
  if (!match) return null;
  return parseFloat(`${match[1]}.${match[2]}`);
}

/** Extract events from HTML page content */
function extractEventsFromHtml(html) {
  const events = [];

  // Match event blocks: look for links to /f/ID/slug pattern
  const eventPattern = /<a[^>]*href="(\/f\/\d+\/[^"]+)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?<\/a>[\s\S]*?<h3[^>]*><a[^>]*>([^<]+)<\/a><\/h3>([\s\S]*?)(?=<a[^>]*href="\/f\/|$)/gi;

  // Simpler approach: find all h3 > a links to /f/ pages
  const titlePattern = /<h3[^>]*>\s*<a[^>]*href="(\/f\/(\d+)\/[^"]*)"[^>]*>([^<]+)<\/a>\s*<\/h3>/gi;
  let match;

  while ((match = titlePattern.exec(html)) !== null) {
    const [, link, id, title] = match;

    // Get surrounding context (next 500 chars after the h3)
    const afterH3 = html.slice(match.index + match[0].length, match.index + match[0].length + 800);

    // Extract venue + city from first <p> or text
    const venueMatch = afterH3.match(/<(?:p|span|div)[^>]*>([^<]+?\([^)]+\))/i)
      || afterH3.match(/<(?:p|span|div)[^>]*>([^<]{5,80})<\//i);
    const venueText = venueMatch ? venueMatch[1].trim() : "";

    // Split venue and city: "Teatreneu (Barcelona)" → venue="Teatreneu", city="Barcelona"
    const venueParts = venueText.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    const venue = venueParts ? venueParts[1].trim() : venueText;
    const city = venueParts ? venueParts[2].trim() : "";

    // Extract dates
    const dateMatch = afterH3.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:-|–|a|al)\s*(\d{1,2}\/\d{1,2}\/\d{4})/i)
      || afterH3.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    const startDate = dateMatch ? parseDate(dateMatch[1]) : "";
    const endDate = dateMatch && dateMatch[2] ? parseDate(dateMatch[2]) : startDate;

    // Extract price
    const priceMatch = afterH3.match(/(\d+[,.]\d+)\s*€/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(",", ".")) : null;

    // Find image before the h3
    const beforeH3 = html.slice(Math.max(0, match.index - 500), match.index);
    const imgMatch = beforeH3.match(/src="(https?:\/\/[^"]*cloudfront[^"]*\.(?:jpg|png|webp)[^"]*)"/i)
      || beforeH3.match(/src="(https?:\/\/[^"]*\.(?:jpg|png|webp)[^"]*)"/i);
    const imageUrl = imgMatch ? imgMatch[1] : "";

    if (title && startDate) {
      events.push({
        id: `cj-${id}`,
        title: title.trim(),
        venue: venue || "Barcelona",
        city,
        category: "teatro",
        description: "",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=500&fit=crop",
        startDate,
        endDate: endDate || startDate,
        price,
        address: "",
        neighborhood: "",
        url: `${DETAIL_BASE}${link}`,
        featured: false,
        tier: 3,
        source: "culturajove",
      });
    }
  }

  return events;
}

async function fetchPage(page) {
  const url = page === 1
    ? `${BASE_URL}?qg=teatre&pr=0%3B20`
    : `${BASE_URL}?qg=teatre&pr=0%3B20&pg=1&page=${page}`;

  console.log(`  Page ${page}...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Yetz/1.0 (Barcelona cultural agenda)",
        "Accept": "text/html",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`  Page ${page} failed: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log("Fetching theater events from CulturaJove.cat...");

  let allEvents = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const html = await fetchPage(page);
    if (!html) continue;

    const events = extractEventsFromHtml(html);
    console.log(`  Found ${events.length} events on page ${page}`);

    if (events.length === 0) break; // No more events
    allEvents.push(...events);

    // Be polite: wait 1 second between requests
    await new Promise(r => setTimeout(r, 1000));
  }

  // Filter: only Barcelona
  const bcnEvents = allEvents.filter(e => isBarcelona(e.venue, e.city));
  console.log(`\nTotal scraped: ${allEvents.length}`);
  console.log(`Barcelona only: ${bcnEvents.length}`);

  // Remove city field before saving
  const cleanEvents = bcnEvents.map(({ city, ...rest }) => rest);

  // Filter future events only
  const todayStr = new Date().toISOString().split("T")[0];
  const futureEvents = cleanEvents.filter(e => e.endDate >= todayStr);
  console.log(`Future events: ${futureEvents.length}`);

  const outputPath = join(__dirname, "..", "public", "culturajove-events.json");
  writeFileSync(outputPath, JSON.stringify(futureEvents, null, 0));
  console.log(`Written to ${outputPath}`);
}

main().catch(err => {
  console.warn("Warning: CulturaJove scraper failed:", err.message);
  console.warn("Continuing without CulturaJove data.");
});
