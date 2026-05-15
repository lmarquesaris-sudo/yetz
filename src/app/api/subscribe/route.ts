import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildNewsletterWelcomeEmail } from "@/lib/emails/newsletter-welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, firstName } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El email es obligatorio" },
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

    // Add contact to Resend audience
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.create({
          email,
          firstName: firstName || "",
          audienceId,
        });
      } catch (contactErr) {
        // Contact might already exist — continue anyway
        console.log("Contact create note:", contactErr);
      }
    }

    // Send welcome email
    const { error } = await resend.emails.send({
      from: "YetzArt <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenido al boletín de YetzArt",
      html: buildNewsletterWelcomeEmail(),
    });

    if (error) {
      console.error("Resend welcome email error:", error);
      return NextResponse.json(
        { error: "Error al enviar el email de bienvenida" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
