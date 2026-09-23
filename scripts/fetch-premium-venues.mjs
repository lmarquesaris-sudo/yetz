/**
 * Yetz — Scraper de venues premium de Barcelona
 * Fuentes: MEAM, y más en el futuro.
 * Estos eventos son de alta calidad y no siempre están en la API del Ajuntament.
 *
 * Run: node scripts/fetch-premium-venues.mjs
 * Output: public/premium-events.json
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── MEAM (Museu Europeu d'Art Modern) ─────────────────────

async function fetchMeam() {
  console.log("  MEAM...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://www.meam.es/es/diary/", {
      headers: { "User-Agent": "Yetz/1.0", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const events = [];
    const monthMap = { ene: "01", feb: "02", mar: "03", abr: "04", may: "05", jun: "06", jul: "07", ago: "08", sep: "09", oct: "10", nov: "11", dic: "12" };

    // Structure: <li> blocks containing <h3><a href="...">Title</a></h3> and <p>date</p>
    // Split by <li> or look for <h3> tags with diary/tickets links
    const h3Pattern = /<h3[^>]*>\s*<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>\s*<\/h3>/gi;
    let match;

    while ((match = h3Pattern.exec(html)) !== null) {
      const [fullMatch, link, title] = match;
      if (!title || title.trim().length < 5) continue;
      if (title.toLowerCase().includes("tickets") || title.toLowerCase().includes("comprar")) continue;

      // Extract ID from link
      const idMatch = link.match(/\/(\d+)\//);
      const id = idMatch ? idMatch[1] : String(match.index);

      // Context: 500 chars before and after the <h3>
      const before = html.slice(Math.max(0, match.index - 500), match.index);
      const after = html.slice(match.index, match.index + 800);
      const context = before + after;

      // Parse date from <p> after <h3>: "Jue, 24 Sep 2026 12:00"
      const dateMatch = after.match(/(?:Lun|Mar|Mié|Jue|Vie|Sáb|Dom|Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*(\d{1,2})\s+(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\s+(\d{4})\s+(\d{1,2}):(\d{2})/i)
        || after.match(/(\d{1,2})\s+(Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)[a-z]*\s+(\d{4})/i);

      let startDate = "";
      let time = "";
      if (dateMatch) {
        const m = monthMap[dateMatch[2].toLowerCase().slice(0, 3)];
        if (m) {
          startDate = `${dateMatch[3]}-${m}-${String(dateMatch[1]).padStart(2, "0")}`;
          if (dateMatch[4]) time = `${dateMatch[4]}:${dateMatch[5]}`;
        }
      }

      // Image: look for <img src="..."> in the <li> before the <h3>
      const imgMatch = before.match(/src="([^"]*(?:\.jpg|\.png|\.webp|rz\.php)[^"]*)"/i);
      let imageUrl = "";
      if (imgMatch) {
        imageUrl = imgMatch[1];
        if (imageUrl.startsWith("/")) imageUrl = `https://www.meam.es${imageUrl}`;
      }

      // Classify category
      const t = title.toLowerCase();
      let category = "exposición";
      if (t.includes("concert") || t.includes("blues") || t.includes("classic") || t.includes("jazz") || t.includes("music") || t.includes("música") || t.includes("quartet") || t.includes("trio")) {
        category = "música";
      } else if (t.includes("live painting") || t.includes("en vivo") || t.includes("live")) {
        category = "exposición"; // Live painting is still visual art
      }

      events.push({
        id: `meam-${id}`,
        title: title.trim(),
        venue: "MEAM — Museu Europeu d'Art Modern",
        category,
        description: time ? `${time}h en MEAM (Barra de Ferro, 5 — El Born)` : "MEAM — Barra de Ferro, 5, El Born",
        imageUrl: imageUrl || "https://www.meam.es/admin/assets/uploads/files/meam-exterior.jpg",
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate: startDate || new Date().toISOString().split("T")[0],
        price: 13,
        address: "Barra de Ferro, 5",
        neighborhood: "El Born",
        url: link.startsWith("http") ? link : `https://www.meam.es${link}`,
        featured: false,
        tier: 1,
        source: "meam",
      });
    }

    console.log(`  MEAM: ${events.length} events`);
    return events;
  } catch (err) {
    console.warn(`  MEAM failed: ${err.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log("Fetching premium venue events...");

  const meamEvents = await fetchMeam();
  // Future: add more venues here
  // const cccbEvents = await fetchCCCB();
  // const miroEvents = await fetchMiro();

  const allEvents = [...meamEvents];

  // Dedup by title similarity
  const seen = new Set();
  const unique = allEvents.filter(e => {
    const key = e.title.toLowerCase().replace(/[^a-záéíóúàèòïüç\s]/g, "").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Only future events
  const todayStr = new Date().toISOString().split("T")[0];
  const future = unique.filter(e => e.endDate >= todayStr);

  console.log(`\nPremium events total: ${future.length}`);

  const outputPath = join(__dirname, "..", "public", "premium-events.json");
  writeFileSync(outputPath, JSON.stringify(future, null, 0));
  console.log(`Written to ${outputPath}`);
}

main().catch(err => {
  console.warn("Warning: Premium venues scraper failed:", err.message);
});
