import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { buildSystemPrompt } from "@/lib/sorprendeme-prompt";
import { generatePlan, matchMood, detectZone } from "@/lib/plans-data";

export const runtime = "edge";

/** Check if the message looks like a plan request vs off-topic */
function isPlanRequest(msg: string): boolean {
  const lower = msg.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  // Plan-related keywords
  const planWords = [
    "plan", "salir", "hacer", "ir", "cenar", "comer", "beber", "copa",
    "paseo", "pasear", "cultura", "museo", "teatro", "musica", "cine",
    "romantico", "romantica", "pareja", "amigos", "barato", "fiesta",
    "noche", "tarde", "manana", "sabado", "domingo", "fin de semana",
    "born", "gotic", "raval", "eixample", "gracia", "poblenou",
    "barceloneta", "montjuic", "sarria", "sant antoni", "clot",
    "horta", "nou barris", "sant andreu", "sant marti", "les corts",
    "sorprendeme", "sorprende", "recomienda", "recomendacion",
    "proponer", "propon", "sugerir", "sugiere", "quiero", "apetece",
    "bar", "restaurante", "cocktail", "vermut", "terraza", "expo",
    "concierto", "festival", "taller", "espectaculo", "aire libre",
  ];
  return planWords.some(w => lower.includes(w));
}

const OFF_TOPIC_RESPONSE =
  `Soy el asistente de Yetz, tu portal cultural de Barcelona. Mi rollo es montarte planes para salir: cultura, gastronomía, paseos, copas... lo que te pida el cuerpo.\n\nCuéntame qué te apetece hacer y te escribo un plan a medida. Puedes decirme una zona, un mood, o simplemente "sorpréndeme".`;

export async function POST(req: Request) {
  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return new Response("Missing message", { status: 400 });
  }

  // Try Gemini first
  try {
    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      system: buildSystemPrompt(message),
      prompt: message,
      maxOutputTokens: 1600,
    });

    if (text && text.length > 20) {
      return streamChunked(text);
    }
  } catch (err: unknown) {
    console.error("[sorprendeme] Gemini failed, using fallback:", err instanceof Error ? err.message : err);
  }

  // Fallback: check if it's actually a plan request
  if (!isPlanRequest(message)) {
    return streamChunked(OFF_TOPIC_RESPONSE);
  }

  // Fallback: local template generation
  const mood = matchMood(message);
  const zone = detectZone(message);
  const plan = generatePlan(mood, zone);

  const fallbackText = `${plan.title}\n*${plan.subtitle}*\n\n${plan.paragraphs.join("\n\n")}`;
  return streamChunked(fallbackText);
}

/** Stream text in small chunks for a typing effect */
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
