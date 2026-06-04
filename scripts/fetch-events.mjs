/**
 * YetzArt — Fetch de eventos CULTURALES de Barcelona
 * Exposiciones, teatro, música, cine, danza, talleres, festivales.
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

// ── Tier 1: grandes salas de teatro, música y cine ──
const TIER_1_PERFORMING = [
  "teatre lliure", "teatre nacional de catalunya", "tnc",
  "gran teatre del liceu", "liceu",
  "mercat de les flors",
  "palau de la música", "palau de la música catalana",
  "razzmatazz", "sala apolo",
  "l'auditori", "auditori",
  "filmoteca de catalunya", "filmoteca",
];

// ── Tier 2: espacios notables con exposiciones / salas ──
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
  "sala beckett", "teatre romea", "teatre poliorama",
  "teatre tívoli", "teatre victòria", "teatre condal",
  "jamboree", "harlem jazz club",
];

function getVenueTier(venueName) {
  const v = (venueName || "").toLowerCase();
  if (TIER_1_CORE.some(t => v.includes(t))) return 1;
  if (TIER_1_EXTENDED.some(t => v.includes(t))) return 1;
  if (TIER_1_PERFORMING.some(t => v.includes(t))) return 1;
  if (VENUE_TIER_2.some(t => v.includes(t))) return 2;
  return 3;
}

// ── Clasificaciones del Ajuntament que queremos ──────────
const CULTURAL_CLASSIFICATIONS = new Set([
  // Visual arts
  "exposicions", "pintura", "dibuix i pintura", "dibuix",
  "escultura", "arts visuals", "arts plàstiques",
  "gravat", "il·lustració", "art contemporani",
  // Theater / performing
  "teatre", "dansa", "circ", "arts escèniques",
  "espectacles", "arts de carrer",
  // Music
  "concerts", "música", "música clàssica", "jazz",
  "festivals de música", "recitals",
  // Cinema
  "cinema", "audiovisuals", "curtmetratges",
  // Workshops / courses (cultural)
  "tallers", "tallers d'art",
  // General cultural
  "cultura", "activitats culturals",
]);

// Keywords que indican evento cultural
const CULTURAL_KEYWORDS = [
  // Visual arts
  "exposic", "pintura", "museu", "galeria", "galería",
  "escultura", "art contempor", "arts visual", "arts plàstic",
  "dibuix", "gravat", "il·lustrac", "retrat", "aquarel",
  "oleo", "oli sobre", "obra gràfica", "col·lecció",
  "instal·lació artística",
  // Theater
  "teatre", "teatro", "òpera", "opera", "comèdia",
  "dramatúrgia", "escenari", "escènic",
  // Music
  "concert", "recital", "música", "musica",
  "festival", "jazz", "orquestra", "simfònic",
  // Dance
  "dansa", "danza", "ballet", "coreograf",
  // Cinema
  "cinema", "documental", "audiovisual", "filmoteca",
  "curtmetratge", "projecc",
  // Workshops
  "taller", "curs d'art", "workshop",
];

// Keywords que EXCLUYEN (no es cultural)
const EXCLUDE_KEYWORDS = [
  "cuina", "cocina", "gastronom",
  "ioga", "yoga", "tai chi", "pilates", "fitness",
  "informàtica", "arduino", "programació",
  "idioma", "anglès", "francès", "curs d'anglès",
  "jardiner", "jardinería", "hort ",
  "escombra", "espart",
  "paper maixé", "manualitats",
  "casal d'estiu", "casal estiu",
  "costura", "teixit", "textil",
  "natació", "piscina",
  "excursió", "senderisme",
];

function isCulturalEvent(raw) {
  const name = (raw.name || "").toLowerCase();
  const body = (raw.body || "").toLowerCase();
  const venue = (raw.addresses?.[0]?.place || raw.addresses?.[0]?.address_name || "").toLowerCase();

  // Explicit exclusions first
  if (EXCLUDE_KEYWORDS.some(kw => name.includes(kw))) return false;

  // If it's at a tier 1 venue, keep it
  const tier = getVenueTier(venue);
  if (tier === 1) return true;

  // Check classifications from the API
  const classNames = (raw.classifications_data || []).map(c => (c.name || "").toLowerCase());
  const secondaryNames = (raw.secondary_filters_data || []).map(c => (c.name || "").toLowerCase());
  const allClassNames = [...classNames, ...secondaryNames];

  const hasCulturalClass = allClassNames.some(n => CULTURAL_CLASSIFICATIONS.has(n));
  if (hasCulturalClass) return true;

  // Keyword match in name
  if (CULTURAL_KEYWORDS.some(kw => name.includes(kw))) return true;

  return false;
}

// ── Categorías ──────────────────────────────────────────
function classifyCategory(raw) {
  const classNames = (raw.classifications_data || []).map(c => c.name?.toLowerCase() || "").join(" ");
  const secondaryNames = (raw.secondary_filters_data || []).map(c => c.name?.toLowerCase() || "").join(" ");
  const name = (raw.name || "").toLowerCase();
  const venue = (raw.addresses?.[0]?.place || "").toLowerCase();
  // Use name + classifications (NOT venue) to avoid venue-name pollution
  const nameAndClass = classNames + " " + secondaryNames + " " + name;
  const combined = nameAndClass + " " + venue;

  // ── Name-based overrides FIRST (most reliable signal) ──

  // Exposición: if the name says "exposició/exposición/col·lecció", it's an exhibition
  if (name.includes("exposic") || name.includes("col·lecci") || name.includes("colecci") ||
      name.includes("mostra ")) return "exposición";

  // Concert/recital in the name → always música (even if API says "dansa")
  if (name.includes("concert") || name.includes("recital") || name.includes("jam session")) return "música";

  // Taller/curs in the name → always taller
  if (name.startsWith("taller") || name.startsWith("curs ")) return "taller";

  // ── Classification-based (API metadata + name combined) ──

  // Theater
  if (nameAndClass.includes("teatre") || nameAndClass.includes("teatro") ||
      nameAndClass.includes("òpera") || nameAndClass.includes("opera") ||
      nameAndClass.includes("circ") || nameAndClass.includes("arts escèniques") ||
      nameAndClass.includes("comèdia")) return "teatro";

  // Dance — only if name or classifications explicitly say dance
  if (nameAndClass.includes("dansa") || nameAndClass.includes("danza") ||
      nameAndClass.includes("ballet") || nameAndClass.includes("coreograf")) return "danza";

  // Music
  if (nameAndClass.includes("concert") || nameAndClass.includes("recital") ||
      nameAndClass.includes("música") || nameAndClass.includes("musica") ||
      nameAndClass.includes("jazz") || nameAndClass.includes("orquestra") ||
      nameAndClass.includes("simfònic")) return "música";

  // Festival
  if (combined.includes("festival")) return "festival";

  // Cinema
  if (combined.includes("cinema") || combined.includes("audiovisual") ||
      combined.includes("documental") || combined.includes("filmoteca") ||
      combined.includes("curtmetratge")) return "cine";

  // Workshop — only from name/classifications, not venue
  if (nameAndClass.includes("taller") || nameAndClass.includes("curs")) return "taller";

  // Museum — venue IS relevant here (events AT museums are museum events)
  if (combined.includes("museu")) return "museo";

  // Gallery
  if (combined.includes("galeri")) return "galería";

  return "exposición";
}

// ── Fallback images by category (pool of 4-5 each) ──────
const FALLBACK_IMAGE_POOLS = {
  exposición: [
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1531913764164-f85c3e01b2aa?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=500&fit=crop",
  ],
  museo: [
    "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1594794312433-05a69a98b7a0?w=800&h=500&fit=crop",
  ],
  galería: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1531913764164-f85c3e01b2aa?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&h=500&fit=crop",
  ],
  taller: [
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1533328818-4e19e4aa4288?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=800&h=500&fit=crop",
  ],
  teatro: [
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1516307365426-bea591f05011?w=800&h=500&fit=crop",
  ],
  música: [
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&h=500&fit=crop",
  ],
  cine: [
    "https://images.unsplash.com/photo-1587974928442-77dc3e0748ae?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&h=500&fit=crop",
  ],
  danza: [
    "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=800&h=500&fit=crop",
  ],
  festival: [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=500&fit=crop",
  ],
};

function getRandomFallback(category) {
  const pool = FALLBACK_IMAGE_POOLS[category] || FALLBACK_IMAGE_POOLS["exposición"];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getImageUrl(raw, category) {
  if (raw.image_data) {
    const panoramic = raw.image_data.cuts?.find(
      c => c.type === "post-image-panoramica" || c.type === "post-image-col1"
    );
    if (panoramic?.image) return panoramic.image;
    if (raw.image_data.image_optimized) return raw.image_data.image_optimized;
    if (raw.image_data.image) return raw.image_data.image;
  }
  return getRandomFallback(category);
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
      if (!isCulturalEvent(raw)) return false;
      if (raw.end_date && raw.end_date.split("T")[0] < todayStr) return false;
      return true;
    })
    .map(transformEvent)
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  // ── Limit low-quality talleres: keep only tier 1-2, or tier 3 with API images (max 80) ──
  const tallerTier12 = artEvents.filter(e => e.category === "taller" && e.tier <= 2);
  const tallerTier3WithImg = artEvents.filter(e => e.category === "taller" && e.tier === 3 && e.imageUrl.includes("estatics-nasia")).slice(0, 80);
  const tallerIds = new Set([...tallerTier12, ...tallerTier3WithImg].map(e => e.id));
  artEvents = artEvents.filter(e => e.category !== "taller" || tallerIds.has(e.id));

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

  console.log(`\nCultural events (active): ${artEvents.length}`);
  console.log(`  Tier 1 (museos/teatros principales): ${tier1.length}`);
  console.log(`  Tier 2 (espacios notables): ${tier2.length}`);
  console.log(`  Tier 3 (otros): ${tier3.length}`);
  console.log(`With API images: ${artEvents.filter(e => e.imageUrl.includes("estatics-nasia")).length}`);
  console.log(`Featured: ${featuredIds.size}`);
  console.log(`Categories: ${[...new Set(artEvents.map(e => e.category))].join(", ")}`);

  // Category breakdown
  const catCounts = {};
  artEvents.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  console.log(`\n── Category breakdown ──`);
  Object.entries(catCounts).sort((a,b) => b[1]-a[1]).forEach(([c, n]) => console.log(`  ${n} | ${c}`));

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
