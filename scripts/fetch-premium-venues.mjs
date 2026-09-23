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

// ── SALA APOLO ────────────────────────────────────────────

async function fetchApolo() {
  console.log("  Sala Apolo...");
  const events = [];

  try {
    for (let page = 1; page <= 4; page++) {
      const url = page === 1
        ? "https://www.sala-apolo.com/es/agenda/"
        : `https://www.sala-apolo.com/es/agenda/?page=${page}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        headers: { "User-Agent": "Yetz/1.0", "Accept": "text/html" },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) break;
      const html = await res.text();

      // Find ALL links to /es/evento/ — each event has 2-3 links (img, title, tickets)
      // Collect unique slugs first, then extract details
      const linkPattern = /href="(\/es\/evento\/([^"#]+))"/gi;
      const slugs = new Map(); // slug → {link, contexts}
      let match;

      while ((match = linkPattern.exec(html)) !== null) {
        const [, link, slug] = match;
        const cleanSlug = slug.replace(/%[0-9A-Fa-f]{2}/g, ""); // Remove URL encoding
        if (!slugs.has(cleanSlug)) {
          slugs.set(cleanSlug, { link, positions: [] });
        }
        slugs.get(cleanSlug).positions.push(match.index);
      }

      for (const [slug, info] of slugs) {
        // Get context around all positions of this event
        let context = "";
        for (const pos of info.positions) {
          context += html.slice(Math.max(0, pos - 100), pos + 300) + " ";
        }

        // Title: text content of <a> that's NOT "Entradas" and NOT an <img>
        const titlePattern = new RegExp(`href="${info.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*([^<]{3,80})\\s*<\\/a>`, "gi");
        let title = "";
        const SKIP_WORDS = ["entrada", "ticket", "gratis", "agotado", "cancelado", "comprar", "buy", "sold out", "more", "ver más"];
        let tm;
        while ((tm = titlePattern.exec(context)) !== null) {
          const t = tm[1].trim();
          if (t && t.length > 5 && !SKIP_WORDS.some(w => t.toLowerCase() === w || t.toLowerCase().includes("entrada"))) {
            title = t;
            break;
          }
        }
        if (!title) continue;

        // Date from slug: name-YYYYMMDD-id
        const dateMatch = slug.match(/(\d{8})-\d+$/);
        let startDate = "";
        if (dateMatch) {
          const d = dateMatch[1];
          startDate = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
        }
        if (!startDate) continue;

        // Time + sala from context: "Artist · Sala Apolo · 23:59"
        const infoMatch = context.match(/·\s*(Sala Apolo|La \(2\)|La Cinc|La 2)\s*·\s*(\d{1,2}:\d{2})/i);
        const sala = infoMatch ? infoMatch[1] : "Sala Apolo";
        const time = infoMatch ? infoMatch[2] : "";

        // Image
        const imgMatch = context.match(/src="(\/uploads\/[^"]+)"/i);
        const imageUrl = imgMatch ? `https://www.sala-apolo.com${imgMatch[1]}` : "";

        const isFree = context.toLowerCase().includes("gratis") || context.toLowerCase().includes("free");

        events.push({
          id: `apolo-${slug.slice(-12)}`,
          title,
          venue: sala === "Sala Apolo" ? "Sala Apolo" : `${sala} (Sala Apolo)`,
          category: "música",
          description: time ? `${time}h en ${sala}` : `Concierto en ${sala}`,
          imageUrl: imageUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
          startDate,
          endDate: startDate,
          price: isFree ? null : 15,
          address: "Carrer Nou de la Rambla, 113",
          neighborhood: "Poble-sec",
          url: `https://www.sala-apolo.com${info.link}`,
          featured: false,
          tier: 1,
          source: "apolo",
        });
      }

      if (slugs.size === 0) break;
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (err) {
    console.warn(`  Apolo failed: ${err.message}`);
  }

  // Dedup
  const unique = new Map();
  events.forEach(e => { if (!unique.has(e.title)) unique.set(e.title, e); });
  const result = [...unique.values()];
  console.log(`  Sala Apolo: ${result.length} events`);
  return result;
}

// ── MACBA (exposiciones) ──────────────────────────────────

async function fetchMacba() {
  console.log("  MACBA...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://www.macba.cat/es/exposiciones-actividades/exposiciones", {
      headers: { "User-Agent": "Yetz/1.0", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const events = [];
    const monthMap = { enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06", julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12" };

    // Structure: <a href="..."><img src="..."><h4>exposición</h4><p>Del X al Y</p></a>
    //            <a href="..."><h2>Title</h2><h3>Subtitle</h3></a>
    // Find <h2> inside <a> tags — these are the main exhibition titles
    const titlePattern = /<a[^>]*href="(https?:\/\/www\.macba\.cat\/[^"]*exposicion[^"]*|\/es\/exposicion[^"]*)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
    let match;

    while ((match = titlePattern.exec(html)) !== null) {
      const [, link, title] = match;
      if (!title || title.trim().length < 5) continue;

      // Look backwards for dates in <p>: "Del 28 de noviembre 2025 al 27 de septiembre 2026"
      const before = html.slice(Math.max(0, match.index - 600), match.index);
      const dateMatch = before.match(/[Dd]el\s+(\d{1,2})\s+(?:de\s+)?(\w+)\s+(\d{4})\s+al\s+(\d{1,2})\s+(?:de\s+)?(\w+)\s+(\d{4})/i);
      let startDate = "", endDate = "";
      if (dateMatch) {
        const sm = monthMap[dateMatch[2].toLowerCase()];
        const em = monthMap[dateMatch[5].toLowerCase()];
        if (sm) startDate = `${dateMatch[3]}-${sm}-${String(dateMatch[1]).padStart(2, "0")}`;
        if (em) endDate = `${dateMatch[6]}-${em}-${String(dateMatch[4]).padStart(2, "0")}`;
      }

      // Image from <img src="https://img.macba.cat/...">
      const imgMatch = before.match(/src="(https:\/\/img\.macba\.cat\/[^"]+)"/i);
      let imageUrl = imgMatch ? imgMatch[1] : "";

      // Subtitle from <h3>
      const after = html.slice(match.index, match.index + 400);
      const subMatch = after.match(/<h3[^>]*>([^<]+)<\/h3>/i);
      const subtitle = subMatch ? subMatch[1].trim() : "";
      const fullTitle = subtitle ? `${title.trim()}: ${subtitle}` : title.trim();

      // Only keep current/future exhibitions
      const todayStr = new Date().toISOString().split("T")[0];
      if (endDate && endDate < todayStr) continue;

      events.push({
        id: `macba-${events.length}`,
        title: fullTitle,
        venue: "MACBA — Museu d'Art Contemporani de Barcelona",
        category: "exposición",
        description: subtitle || `Exposición en MACBA`,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
        startDate: startDate || todayStr,
        endDate: endDate || "",
        price: 11,
        address: "Plaça dels Àngels, 1",
        neighborhood: "El Raval",
        url: link.startsWith("http") ? link : `https://www.macba.cat${link}`,
        featured: true,
        tier: 1,
        source: "macba",
      });
    }

    console.log(`  MACBA: ${events.length} exhibitions`);
    return events;
  } catch (err) {
    console.warn(`  MACBA failed: ${err.message}`);
    return [];
  }
}

// ── RAZZMATAZZ (sitemap → conciertos) ────────────────────

async function fetchRazzmatazz() {
  console.log("  Razzmatazz...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://www.salarazzmatazz.com/__sitemap__/es.xml", {
      headers: { "User-Agent": "Yetz/1.0", "Accept": "application/xml,text/xml" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();

    const todayStr = new Date().toISOString().split("T")[0];
    const events = [];
    const seenSlugs = new Set();

    // Known recurring club nights to skip
    const SKIP_SLUGS = ["la-electronica", "mandanga-pika-pika", "perreo-room", "karaoke-room", "fury1"];

    // Extract all /agenda/DD-MM-YYYY-slug/ URLs
    const urlPattern = /<loc>\s*(https:\/\/www\.salarazzmatazz\.com\/agenda\/(\d{2})-(\d{2})-(\d{4})-([^/]+)\/)\s*<\/loc>/gi;
    let match;

    while ((match = urlPattern.exec(xml)) !== null) {
      const [, url, dd, mm, yyyy, slug] = match;
      const startDate = `${yyyy}-${mm}-${dd}`;

      // Only future dates
      if (startDate < todayStr) continue;

      // Skip known recurring club nights
      if (SKIP_SLUGS.some(s => slug.includes(s))) continue;

      // Dedup: same slug across different dates = recurring event, keep only first
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      // Parse title from slug: replace hyphens with spaces, capitalize
      const title = slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());

      events.push({
        id: `razz-${dd}${mm}${yyyy}-${slug.slice(0, 20)}`,
        title,
        venue: "Razzmatazz",
        category: "música",
        description: `Concierto en Razzmatazz`,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop",
        startDate,
        endDate: startDate,
        price: 18,
        address: "Carrer dels Almogàvers, 122",
        neighborhood: "Poblenou",
        url,
        featured: false,
        tier: 1,
        source: "razzmatazz",
      });
    }

    console.log(`  Razzmatazz: ${events.length} events`);
    return events;
  } catch (err) {
    console.warn(`  Razzmatazz failed: ${err.message}`);
    return [];
  }
}

// ── CCCB (Centre de Cultura Contemporània) ───────────────

async function fetchCCCB() {
  console.log("  CCCB...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://www.cccb.org/ca/calendari", {
      headers: { "User-Agent": "Yetz/1.0", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const events = [];
    const todayStr = new Date().toISOString().split("T")[0];

    const monthMapCat = {
      gener: "01", febrer: "02", març: "03", abril: "04", maig: "05", juny: "06",
      juliol: "07", agost: "08", setembre: "09", octubre: "10", novembre: "11", desembre: "12",
    };
    const monthMapEs = {
      enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
      julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    const allMonths = { ...monthMapCat, ...monthMapEs };

    // Find links to exhibitions: /ca/exposicions/* or /ca/activitats/*
    const linkPattern = /<a[^>]*href="(https?:\/\/www\.cccb\.org\/ca\/(?:exposicions|activitats)\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkPattern.exec(html)) !== null) {
      const [fullMatch, link, innerHtml] = match;

      // Extract text title (strip HTML tags)
      const title = innerHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 3) continue;

      const isExhibition = link.includes("/exposicions/");
      const category = isExhibition ? "exposición" : "exposición";

      // Look for dates in surrounding context
      const after = html.slice(match.index, match.index + 600);
      const before = html.slice(Math.max(0, match.index - 400), match.index);
      const context = before + after;

      let startDate = todayStr;
      let endDate = "";

      // Pattern: "Del DD de month YYYY al DD de month YYYY"
      const rangeMatch = context.match(/[Dd]el\s+(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})\s+al\s+(\d{1,2})\s+(?:de\s+)?(\w+)\s+(?:de\s+)?(\d{4})/i);
      if (rangeMatch) {
        const sm = allMonths[rangeMatch[2].toLowerCase()];
        const em = allMonths[rangeMatch[5].toLowerCase()];
        if (sm) startDate = `${rangeMatch[3]}-${sm}-${String(rangeMatch[1]).padStart(2, "0")}`;
        if (em) endDate = `${rangeMatch[6]}-${em}-${String(rangeMatch[4]).padStart(2, "0")}`;
      }

      // Pattern: DD/MM/YYYY
      if (!rangeMatch) {
        const simpleDate = context.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (simpleDate) {
          startDate = `${simpleDate[3]}-${simpleDate[2]}-${simpleDate[1]}`;
        }
      }

      // Skip past events
      const checkEnd = endDate || startDate;
      if (checkEnd && checkEnd < todayStr) continue;

      // Image
      const imgMatch = context.match(/src="([^"]*(?:\.jpg|\.png|\.webp)[^"]*)"/i);
      let imageUrl = "";
      if (imgMatch) {
        imageUrl = imgMatch[1];
        if (imageUrl.startsWith("/")) imageUrl = `https://www.cccb.org${imageUrl}`;
      }

      events.push({
        id: `cccb-${events.length}`,
        title,
        venue: "CCCB — Centre de Cultura Contemporània de Barcelona",
        category,
        description: isExhibition ? `Exposició al CCCB` : `Activitat al CCCB`,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
        startDate,
        endDate: endDate || startDate,
        price: 6,
        address: "Montalegre, 5",
        neighborhood: "El Raval",
        url: link.startsWith("http") ? link : `https://www.cccb.org${link}`,
        featured: false,
        tier: 1,
        source: "cccb",
      });
    }

    // Dedup by title
    const unique = new Map();
    events.forEach(e => { if (!unique.has(e.title.toLowerCase())) unique.set(e.title.toLowerCase(), e); });
    const result = [...unique.values()];
    console.log(`  CCCB: ${result.length} events`);
    return result;
  } catch (err) {
    console.warn(`  CCCB failed: ${err.message}`);
    return [];
  }
}

// ── TEATRE LLIURE ────────────────────────────────────────

async function fetchTeatreLliure() {
  console.log("  Teatre Lliure...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch("https://www.teatrelliure.com/ca/temporada-26-27", {
      headers: { "User-Agent": "Yetz/1.0", "Accept": "text/html" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();

    const events = [];
    const todayStr = new Date().toISOString().split("T")[0];

    // Map salas to neighborhoods
    const salaMap = {
      "sala fabià puigserver": { venue: "Teatre Lliure — Sala Fabià Puigserver", neighborhood: "Poble-sec" },
      "espai lliure": { venue: "Teatre Lliure — Espai Lliure", neighborhood: "Poble-sec" },
      "lliure de gràcia": { venue: "Teatre Lliure de Gràcia", neighborhood: "Gràcia" },
      "lliure de gracia": { venue: "Teatre Lliure de Gràcia", neighborhood: "Gràcia" },
    };

    // Find show blocks: look for links with titles + date patterns
    // Dates appear as DD/MM–DD/MM/YY or DD/MM/YY
    const blockPattern = /<a[^>]*href="(\/ca\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = blockPattern.exec(html)) !== null) {
      const [fullMatch, link, innerHtml] = match;
      const context = html.slice(match.index, match.index + 800);
      const before = html.slice(Math.max(0, match.index - 300), match.index);
      const fullContext = before + context;

      // Extract title: look for text in strong/h2/h3 or uppercase text
      let title = innerHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 3 || title.length > 120) continue;
      // Skip navigation links and generic items
      if (title.toLowerCase().includes("temporada") || title.toLowerCase().includes("abona") || title.toLowerCase().includes("entrad")) continue;

      // Date pattern: DD/MM–DD/MM/YY or DD/MM/YY–DD/MM/YY
      const dateRangeMatch = fullContext.match(/(\d{1,2})\/(\d{2})[\s]*[–\-][\s]*(\d{1,2})\/(\d{2})\/(\d{2})/);
      const singleDateMatch = fullContext.match(/(\d{1,2})\/(\d{2})\/(\d{2})/);

      let startDate = "";
      let endDate = "";

      if (dateRangeMatch) {
        const [, startDay, startMonth, endDay, endMonth, yearShort] = dateRangeMatch;
        const year = `20${yearShort}`;
        startDate = `${year}-${startMonth}-${String(startDay).padStart(2, "0")}`;
        endDate = `${year}-${endMonth}-${String(endDay).padStart(2, "0")}`;
      } else if (singleDateMatch) {
        const [, day, month, yearShort] = singleDateMatch;
        const year = `20${yearShort}`;
        startDate = `${year}-${month}-${String(day).padStart(2, "0")}`;
        endDate = startDate;
      }

      if (!startDate) continue;

      // Skip past events
      if (endDate && endDate < todayStr) continue;
      if (!endDate && startDate < todayStr) continue;

      // Detect sala
      const salaMatch = fullContext.match(/(Sala Fabià Puigserver|Espai Lliure|Lliure de Gràcia|Lliure de Gracia)/i);
      const salaKey = salaMatch ? salaMatch[1].toLowerCase() : "sala fabià puigserver";
      const salaInfo = salaMap[salaKey] || salaMap["sala fabià puigserver"];

      // Image: look for teatrelliure.com/images/ URL
      const imgMatch = fullContext.match(/(?:src|data-src)="((?:https?:\/\/www\.teatrelliure\.com)?\/images\/[^"]+)"/i);
      let imageUrl = "";
      if (imgMatch) {
        imageUrl = imgMatch[1];
        if (imageUrl.startsWith("/")) imageUrl = `https://www.teatrelliure.com${imageUrl}`;
      }

      events.push({
        id: `lliure-${events.length}`,
        title,
        venue: salaInfo.venue,
        category: "teatro",
        description: `Teatre Lliure — ${salaInfo.venue}`,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=500&fit=crop",
        startDate,
        endDate: endDate || startDate,
        price: 22,
        address: salaKey.includes("gràcia") || salaKey.includes("gracia") ? "Carrer de Montseny, 47" : "Plaça Margarida Xirgu, 1",
        neighborhood: salaInfo.neighborhood,
        url: `https://www.teatrelliure.com${link}`,
        featured: false,
        tier: 1,
        source: "teatrelliure",
      });
    }

    // Dedup by title
    const unique = new Map();
    events.forEach(e => { if (!unique.has(e.title.toLowerCase())) unique.set(e.title.toLowerCase(), e); });
    const result = [...unique.values()];
    console.log(`  Teatre Lliure: ${result.length} shows`);
    return result;
  } catch (err) {
    console.warn(`  Teatre Lliure failed: ${err.message}`);
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log("Fetching premium venue events...");

  const [meamEvents, apoloEvents, macbaEvents, razzEvents, cccbEvents, lliureEvents] = await Promise.all([
    fetchMeam(),
    fetchApolo(),
    fetchMacba(),
    fetchRazzmatazz(),
    fetchCCCB(),
    fetchTeatreLliure(),
  ]);

  const allEvents = [...meamEvents, ...apoloEvents, ...macbaEvents, ...razzEvents, ...cccbEvents, ...lliureEvents];

  // Dedup by title + source (allow same title from different sources)
  const seen = new Set();
  const unique = allEvents.filter(e => {
    const key = `${e.source}__${e.title.toLowerCase().slice(0, 40)}`;
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
