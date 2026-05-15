/**
 * YetzArt — Fetch de eventos de PINTURA de Barcelona
 * Solo pintura, dibujo, arte visual. Nada más.
 *
 * Run: node scripts/fetch-events.mjs
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_URL =
  "https://opendata-ajuntament.barcelona.cat/data/dataset/2767159c-1c98-46b8-a686-2b25b40cb053/resource/59b9c807-f6c1-4c10-ac51-1ace65485079/download";

// ── Los 5 museos principales (siempre Tier 1) ──────────
const TIER_1_CORE = [
  "museu d'art contemporani de barcelona", "macba",
  "centre de cultura contemporània de barcelona", "cccb",
  "fundació joan miró",
  "museu picasso",
  "museu nacional d'art de catalunya", "mnac",
];

// ── Otros museos/fundaciones de arte relevantes (Tier 1 también) ──
const TIER_1_EXTENDED = [
  "museu tàpies", "fundació antoni tàpies", "fundació museu tàpies",
  "museu europeu d'art modern", "meam",
  "museu de pintura contemporània can framis",
  "fundació suñol",
  "museu frederic marès",
  "fundació fran daurel",
  "caixaforum barcelona", "caixaforum",
  "moco museum",
  "centre d'arts santa mònica",
  "la virreina centre de la imatge",
  "fundació catalunya la pedrera", "la pedrera",
];

// ── Tier 2: espacios notables con exposiciones de pintura ──
const VENUE_TIER_2 = [
  "museu reial monestir de santa maria de pedralbes",
  "museu diocesà de barcelona",
  "palau robert", "jardins del palau robert",
  "el born centre de cultura", "el born. museu",
  "muhba", "museu d'història de barcelona",
  "museu etnològic",
  "sala d'exposicions",
  "fabra i coats",
  "oliva artés",
  "casa padellàs",
  "disseny hub barcelona",
];

function getVenueTier(venueName) {
  const v = (venueName || "").toLowerCase();
  if (TIER_1_CORE.some(t => v.includes(t))) return 1;
  if (TIER_1_EXTENDED.some(t => v.includes(t))) return 1;
  if (VENUE_TIER_2.some(t => v.includes(t))) return 2;
  return 3;
}

// ── Filtro: solo pintura/arte visual ──────────────────────
// Clasificaciones del Ajuntament que SÍ queremos
const PAINTING_CLASSIFICATIONS = new Set([
  "exposicions",
  "pintura",
  "dibuix i pintura",
  "dibuix",
  "escultura",
  "arts visuals",
  "arts plàstiques",
  "gravat",
  "il·lustració",
  "art contemporani",
]);

// Keywords que indican pintura/arte visual
const PAINTING_KEYWORDS = [
  "exposic", "pintura", "museu", "galeria", "galería",
  "escultura", "art contempor", "arts visual", "arts plàstic",
  "dibuix", "gravat", "il·lustrac", "retrat", "aquarel",
  "oleo", "oli sobre", "obra gràfica", "col·lecció",
  "instal·lació artística",
];

// Keywords que EXCLUYEN (no es pintura)
const EXCLUDE_KEYWORDS = [
  "fotografia", "fotografía", "foto ",
  "concert", "recital", "música", "musica",
  "dansa", "danza", "ballet",
  "cinema", "audiovisual", "documental",
  "teatre", "teatro", "òpera", "opera",
  "ceràmica", "ceramica",
  "costura", "teixit", "textil",
  "cuina", "cocina", "gastronom",
  "ioga", "yoga", "tai chi", "pilates",
  "informàtica", "arduino", "programació",
  "idioma", "anglès", "francès",
  "jardiner", "jardinería", "hort ",
  "escombra", "espart",
  "paper maixé", "manualitats",
  "casal d'estiu",
];

function isPaintingEvent(raw) {
  const name = (raw.name || "").toLowerCase();
  const body = (raw.body || "").toLowerCase();
  const text = name + " " + body;
  const venue = (raw.addresses?.[0]?.place || "").toLowerCase();

  // If it's at a tier 1 museum, keep it unless clearly not art
  const tier = getVenueTier(raw.addresses?.[0]?.place || raw.addresses?.[0]?.address_name || "");
  const isMajorMuseum = tier === 1;

  // Explicit exclusions (even at major museums, skip concerts/dance/cinema)
  const hardExclude = ["concert", "recital", "música", "dansa", "ballet",
    "òpera", "cinema", "teatre", "casal d'estiu"];
  if (hardExclude.some(kw => name.includes(kw))) return false;

  // At major museums: keep expositions, workshops, installations
  if (isMajorMuseum) {
    // Only exclude if it's clearly not visual art
    if (EXCLUDE_KEYWORDS.some(kw => name.includes(kw))) return false;
    return true;
  }

  // For other venues: must match painting classifications or keywords
  const classNames = (raw.classifications_data || []).map(c => (c.name || "").toLowerCase());
  const hasPaintingClass = classNames.some(n => PAINTING_CLASSIFICATIONS.has(n));

  // Check secondary filters too
  const secondaryNames = (raw.secondary_filters_data || []).map(c => (c.name || "").toLowerCase());
  const hasSecondaryPainting = secondaryNames.some(n => PAINTING_CLASSIFICATIONS.has(n));

  if (hasPaintingClass || hasSecondaryPainting) {
    // Has painting classification, but check exclusions
    if (EXCLUDE_KEYWORDS.some(kw => name.includes(kw))) return false;
    return true;
  }

  // Keyword match in name
  if (PAINTING_KEYWORDS.some(kw => name.includes(kw))) {
    if (EXCLUDE_KEYWORDS.some(kw => name.includes(kw))) return false;
    return true;
  }

  return false;
}

// ── Categorías (solo pintura) ──────────────────────────
function classifyCategory(raw) {
  const classNames = (raw.classifications_data || []).map(c => c.name?.toLowerCase() || "").join(" ");
  const name = (raw.name || "").toLowerCase();
  const combined = classNames + " " + name;

  if (combined.includes("taller") || combined.includes("curs")) return "taller";
  if (combined.includes("museu")) return "museo";
  if (combined.includes("galeri")) return "galería";
  return "exposición";
}

const FALLBACK_IMAGES = {
  exposición: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
  museo: "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=800&h=500&fit=crop",
  galería: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop",
  taller: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=500&fit=crop",
};

function getImageUrl(raw, category) {
  if (raw.image_data) {
    const panoramic = raw.image_data.cuts?.find(
      c => c.type === "post-image-panoramica" || c.type === "post-image-col1"
    );
    if (panoramic?.image) return panoramic.image;
    if (raw.image_data.image_optimized) return raw.image_data.image_optimized;
    if (raw.image_data.image) return raw.image_data.image;
  }
  return FALLBACK_IMAGES[category];
}

function getWebUrl(raw) {
  const webAttr = raw.attribute_categories
    ?.flatMap(cat => cat.attributes || [])
    ?.find(attr => attr.name === "Web");
  return webAttr?.values?.[0]?.url_value || "";
}

function getPrice(raw) {
  const tickets = raw.tickets_data || [];
  const isFree = tickets.some(t =>
    ["lliure", "gratuït", "gratuïta", "free", "gratis"].includes((t.name || "").toLowerCase())
  );
  if (isFree) return null;
  const timetableHtml = raw.timetable?.html || "";
  const priceMatch = timetableHtml.match(/(\d+(?:[.,]\d+)?)\s*€/);
  if (priceMatch) return parseFloat(priceMatch[1].replace(",", "."));
  return null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s+/g, " ").trim();
}

function transformEvent(raw) {
  const category = classifyCategory(raw);
  const addr = raw.addresses?.[0];
  const venue = addr?.place || addr?.address_name || "Barcelona";
  return {
    id: String(raw.register_id),
    title: raw.name || "Sin título",
    venue,
    category,
    description: stripHtml(raw.body || "").slice(0, 300),
    imageUrl: getImageUrl(raw, category),
    startDate: raw.start_date ? raw.start_date.split("T")[0] : new Date().toISOString().split("T")[0],
    endDate: raw.end_date ? raw.end_date.split("T")[0] : "",
    price: getPrice(raw),
    address: addr ? `${addr.address_name || ""}${addr.street_number_1 ? ", " + addr.street_number_1 : ""}` : "",
    neighborhood: addr?.neighborhood_name || addr?.district_name || "",
    url: getWebUrl(raw),
    featured: false,
    tier: getVenueTier(venue),
  };
}

async function main() {
  console.log("Fetching events from Barcelona Open Data API...");
  const response = await fetch(API_URL, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "YetzArt/1.0 (Barcelona cultural agenda)",
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("json")) {
    throw new Error(`Expected JSON but got: ${contentType}`);
  }

  const data = await response.json();
  console.log(`Total events in API: ${data.length}`);

  const todayStr = new Date().toISOString().split("T")[0];

  let artEvents = data
    .filter(raw => {
      if (raw.status !== "published") return false;
      if (!isPaintingEvent(raw)) return false;
      if (raw.end_date && raw.end_date.split("T")[0] < todayStr) return false;
      return true;
    })
    .map(transformEvent)
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  // Featured: tier 1 events with API images
  const tier1WithImg = artEvents.filter(e => e.tier === 1 && e.imageUrl.includes("estatics-nasia"));
  const featuredIds = new Set(tier1WithImg.slice(0, 6).map(e => e.id));
  if (featuredIds.size < 3) {
    artEvents.filter(e => e.tier <= 2 && e.imageUrl.includes("estatics-nasia"))
      .slice(0, 6).forEach(e => featuredIds.add(e.id));
  }

  artEvents = artEvents.map(e => ({ ...e, featured: featuredIds.has(e.id) }));

  const tier1 = artEvents.filter(e => e.tier === 1);
  const tier2 = artEvents.filter(e => e.tier === 2);
  const tier3 = artEvents.filter(e => e.tier === 3);

  console.log(`\nPainting events (active): ${artEvents.length}`);
  console.log(`  Tier 1 (museos principales): ${tier1.length}`);
  console.log(`  Tier 2 (espacios notables): ${tier2.length}`);
  console.log(`  Tier 3 (otros): ${tier3.length}`);
  console.log(`With API images: ${artEvents.filter(e => e.imageUrl.includes("estatics-nasia")).length}`);
  console.log(`Featured: ${featuredIds.size}`);
  console.log(`Categories: ${[...new Set(artEvents.map(e => e.category))].join(", ")}`);

  // Show tier 1 summary
  console.log(`\n── Tier 1 venues ──`);
  const t1venues = {};
  tier1.forEach(e => { t1venues[e.venue] = (t1venues[e.venue] || 0) + 1; });
  Object.entries(t1venues).sort((a,b) => b[1]-a[1]).forEach(([v, c]) => console.log(`  ${c} | ${v}`));

  const outputPath = join(__dirname, "..", "public", "events.json");
  writeFileSync(outputPath, JSON.stringify(artEvents, null, 0));
  console.log(`\nWritten ${artEvents.length} events to public/events.json`);
  console.log(`File size: ${(JSON.stringify(artEvents).length / 1024).toFixed(0)} KB`);
}

main().catch(err => {
  console.warn("Warning: Could not fetch events from API:", err.message);
  console.warn("Using existing events.json if available.");
});
