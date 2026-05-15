import { Event, Category } from "./types";

const API_URL =
  "https://opendata-ajuntament.barcelona.cat/data/dataset/2767159c-1c98-46b8-a686-2b25b40cb053/resource/59b9c807-f6c1-4c10-ac51-1ace65485079/download";

// Art/painting classification IDs from the Ajuntament taxonomy
const ART_CLASSIFICATION_NAMES = new Set([
  "exposicions",
  "pintura",
  "dibuix i pintura",
  "fotografia",
  "escultura",
  "arts visuals",
  "arts plàstiques",
  "gravat",
  "il·lustració",
  "instal·lació artística",
  "ceràmica",
  "art digital",
  "videoart",
  "art contemporani",
]);

// Keywords to match in event name/body for art-related content
const ART_KEYWORDS = [
  "exposic",
  "pintura",
  "museu",
  "galeria",
  "galería",
  "fotografi",
  "escultura",
  "art contempor",
  "arts visual",
  "arts plàstic",
  "dibuix",
  "gravat",
  "il·lustrac",
  "instal·lació",
  "ceràmica",
  "retrat",
  "aquarel",
  "oleo",
  "oli ",
  "mural",
  "obra gràfica",
  "col·lecció",
];

// Fallback images by category when the API doesn't provide one
const FALLBACK_IMAGES: Record<Category, string> = {
  exposición:
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
  museo:
    "https://images.unsplash.com/photo-1572947650440-e8a97ef053b2?w=800&h=500&fit=crop",
  galería:
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=500&fit=crop",
  taller:
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=500&fit=crop",
  teatro:
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=500&fit=crop",
  música:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
  danza:
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=500&fit=crop",
  cine:
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
  festival:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=500&fit=crop",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function classifyCategory(raw: any): Category {
  const classNames = (raw.classifications_data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => c.name?.toLowerCase() || "")
    .join(" ");
  const name = (raw.name || "").toLowerCase();
  const combined = classNames + " " + name;

  if (combined.includes("taller") || combined.includes("curs")) return "taller";
  if (combined.includes("museu")) return "museo";
  if (combined.includes("galeri")) return "galería";
  return "exposición";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArtEvent(raw: any): boolean {
  // Check classifications
  const classNames = (raw.classifications_data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => (c.name || "").toLowerCase());

  if (classNames.some((n: string) => ART_CLASSIFICATION_NAMES.has(n))) return true;

  // Check secondary filters
  const secondaryNames = (raw.secondary_filters_data || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((c: any) => (c.name || "").toLowerCase());

  if (secondaryNames.some((n: string) => ART_CLASSIFICATION_NAMES.has(n))) return true;

  // Check name and body with keywords
  const text = ((raw.name || "") + " " + (raw.body || "")).toLowerCase();
  return ART_KEYWORDS.some((kw) => text.includes(kw));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getImageUrl(raw: any, category: Category): string {
  // Try optimized image first, then original
  if (raw.image_data) {
    // Prefer panoramic cut (760x428) for cards
    const panoramic = raw.image_data.cuts?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (c: any) => c.type === "post-image-panoramica" || c.type === "post-image-col1"
    );
    if (panoramic?.image) return panoramic.image;
    if (raw.image_data.image_optimized) return raw.image_data.image_optimized;
    if (raw.image_data.image) return raw.image_data.image;
  }
  return FALLBACK_IMAGES[category];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getWebUrl(raw: any): string {
  // Extract URL from attribute_categories
  const webAttr = raw.attribute_categories
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.flatMap((cat: any) => cat.attributes || [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.find((attr: any) => attr.name === "Web");

  if (webAttr?.values?.[0]?.url_value) {
    return webAttr.values[0].url_value;
  }
  return "";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPrice(raw: any): number | null {
  const tickets = raw.tickets_data || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isFree = tickets.some((t: any) =>
    ["lliure", "gratuït", "gratuïta", "free", "gratis"].includes(
      (t.name || "").toLowerCase()
    )
  );
  if (isFree) return null;

  // Try to extract price from timetable HTML
  const timetableHtml = raw.timetable?.html || "";
  const priceMatch = timetableHtml.match(/(\d+(?:[.,]\d+)?)\s*€/);
  if (priceMatch) return parseFloat(priceMatch[1].replace(",", "."));

  return null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformEvent(raw: any): Event {
  const category = classifyCategory(raw);
  const addr = raw.addresses?.[0];

  return {
    id: String(raw.register_id),
    title: raw.name || "Sin título",
    venue: addr?.place || addr?.address_name || "Barcelona",
    category,
    description: stripHtml(raw.body || "").slice(0, 300),
    imageUrl: getImageUrl(raw, category),
    startDate: raw.start_date
      ? raw.start_date.split("T")[0]
      : new Date().toISOString().split("T")[0],
    endDate: raw.end_date
      ? raw.end_date.split("T")[0]
      : "",
    price: getPrice(raw),
    address: addr
      ? `${addr.address_name || ""}${addr.street_number_1 ? ", " + addr.street_number_1 : ""}`
      : "",
    neighborhood: addr?.neighborhood_name || addr?.district_name || "",
    url: getWebUrl(raw),
    featured: false,
  };
}

export async function fetchArtEvents(): Promise<Event[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any[] = await response.json();
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const artEvents = data
    .filter((raw) => {
      // Only published events
      if (raw.status !== "published") return false;
      // Must be art-related
      if (!isArtEvent(raw)) return false;
      // Filter out past events (end_date before today, unless no end_date = permanent)
      if (raw.end_date && raw.end_date.split("T")[0] < todayStr) return false;
      return true;
    })
    .map(transformEvent)
    // Sort: upcoming first, then by start date
    .sort((a, b) => {
      const aStart = new Date(a.startDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      return aStart - bStart;
    });

  // Mark top 6 as featured (most recent events with images from API)
  const withApiImage = artEvents.filter((e) =>
    e.imageUrl.includes("estatics-nasia")
  );
  const featuredIds = new Set(
    withApiImage.slice(0, 6).map((e) => e.id)
  );

  // If fewer than 3 with API images, just feature the first 6
  if (featuredIds.size < 3) {
    artEvents.slice(0, 6).forEach((e) => featuredIds.add(e.id));
  }

  return artEvents.map((e) => ({
    ...e,
    featured: featuredIds.has(e.id),
  }));
}
