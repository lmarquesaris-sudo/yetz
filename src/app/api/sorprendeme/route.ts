import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/sorprendeme-prompt";
import { generatePlan, matchMood, detectZone } from "@/lib/plans-data";

export const runtime = "edge";

function isPlanRequest(msg: string): boolean {
  const lower = msg.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const planWords = [
    // Catalan
    "pla", "sortir", "fer", "anar", "sopar", "menjar", "beure", "copa",
    "passeig", "passejar", "cultura", "museu", "teatre", "musica", "cine", "cinema",
    "romantic", "romantica", "parella", "amics", "barat", "festa",
    "nit", "tarda", "mati", "dissabte", "diumenge", "cap de setmana",
    "born", "gotic", "raval", "eixample", "gracia", "poblenou",
    "barceloneta", "montjuic", "sarria", "sant antoni", "clot",
    "horta", "nou barris", "sant andreu", "sant marti", "les corts",
    "sorprenme", "sorpren", "recomana", "recomanacio",
    "proposar", "proposa", "suggerir", "suggereix", "vull", "ve de gust",
    "bar", "restaurant", "cocktail", "vermut", "terrassa", "expo",
    "concert", "festival", "taller", "espectacle", "aire lliure",
    "cita", "gastronomia", "cuina",
    // Spanish fallback
    "plan", "salir", "hacer", "ir", "cenar", "comer", "beber",
    "paseo", "pasear", "museo", "teatro", "cine",
    "romantico", "pareja", "amigos", "barato", "fiesta",
    "noche", "tarde", "manana", "sabado", "domingo", "fin de semana",
    "sorprendeme", "sorprende", "recomienda", "quiero", "apetece",
    "restaurante", "terraza", "concierto", "taller",
  ];
  return planWords.some(w => lower.includes(w));
}

const OFF_TOPIC_RESPONSE =
  `Soc la veu de Yetz, el teu portal cultural de Barcelona. El meu rotllo és muntar-te plans per sortir: cultura, gastronomia, passejades, copes... el que et demani el cos.\n\nExplica'm què et ve de gust fer i t'escric un pla a mida. Pots dir-me una zona, un mood, o simplement "sorprèn-me".`;

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return new Response("Missing message", { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      system: buildSystemPrompt(message),
      prompt: message,
      maxOutputTokens: 2400,
    });

    if (text && text.length > 20) {
      return streamChunked(text);
    }
  } catch (err: unknown) {
    console.error("[sorprendeme] Gemini failed, using fallback:", err instanceof Error ? err.message : err);
  }

  if (!isPlanRequest(message)) {
    return streamChunked(OFF_TOPIC_RESPONSE);
  }

  const mood = matchMood(message);
  const zone = detectZone(message);
  const plan = generatePlan(mood, zone);

  const fallbackText = `${plan.title}\n*${plan.subtitle}*\n\n${plan.paragraphs.join("\n\n")}`;
  return streamChunked(fallbackText);
}

function streamChunked(text: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 6;
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
