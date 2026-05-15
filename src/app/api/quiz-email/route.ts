import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PAINTERS } from "@/lib/quiz-data";
import { buildQuizResultEmail } from "@/lib/emails/quiz-result";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  if (!resend) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 503 });
  }
  try {
    const { email, painterId } = await request.json();

    if (!email || !painterId) {
      return NextResponse.json(
        { error: "Email y painterId son obligatorios" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }

    const painter = PAINTERS.find((p) => p.id === painterId);
    if (!painter) {
      return NextResponse.json(
        { error: "Pintor no encontrado" },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "YetzArt <onboarding@resend.dev>",
      to: [email],
      subject: `Tu match artístico: eres ${painter.name}`,
      html: buildQuizResultEmail(painter),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Error al enviar el email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quiz email error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
