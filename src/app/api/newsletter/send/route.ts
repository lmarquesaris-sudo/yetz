import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildMonthlyNewsletterEmail } from "@/lib/emails/monthly-newsletter";
import { Event } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY!);

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function formatDateRange(start: string, end: string) {
  if (!end) return `Desde ${formatDate(start)}`;
  return `${formatDate(start)} — ${formatDate(end)}`;
}

// Vercel Cron uses GET
export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return sendNewsletter();
}

// Manual trigger via POST
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return sendNewsletter();
}

async function sendNewsletter() {
  try {
    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (!audienceId) {
      return NextResponse.json(
        { error: "RESEND_AUDIENCE_ID not configured" },
        { status: 500 }
      );
    }

    // Load events
    let events: Event[] = [];
    try {
      const baseUrl =
        process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : "https://artmatch-gamma.vercel.app";
      const res = await fetch(`${baseUrl}/events.json`);
      events = await res.json();
    } catch {
      return NextResponse.json(
        { error: "Could not load events data" },
        { status: 500 }
      );
    }

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthName = now.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
    const monthDisplay =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const baseUrl = "https://artmatch-gamma.vercel.app";

    // Featured events
    const featured = events
      .filter((e) => e.featured && (!e.tier || e.tier <= 1))
      .slice(0, 5)
      .map((e) => ({
        title: e.title,
        venue: e.venue,
        dates: formatDateRange(e.startDate, e.endDate),
        price: e.price === null ? "Gratis" : `${e.price} €`,
        url: `${baseUrl}/evento/${e.id}`,
      }));

    // Exhibitions from top venues
    const exhibitions = events
      .filter(
        (e) =>
          e.category === "exposición" &&
          (!e.tier || e.tier <= 2) &&
          !e.featured
      )
      .slice(0, 5)
      .map((e) => ({
        title: e.title,
        venue: e.venue,
        dates: formatDateRange(e.startDate, e.endDate),
        price: e.price === null ? "Gratis" : `${e.price} €`,
        url: `${baseUrl}/evento/${e.id}`,
      }));

    // Last days
    const lastDays = events
      .filter((e) => {
        if (!e.endDate) return false;
        const end = new Date(e.endDate);
        return end >= now && end <= nextMonth && (!e.tier || e.tier <= 2);
      })
      .sort(
        (a, b) =>
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      )
      .slice(0, 4)
      .map((e) => ({
        title: e.title,
        venue: e.venue,
        dates: `Hasta ${formatDate(e.endDate)}`,
        price: e.price === null ? "Gratis" : `${e.price} €`,
        url: `${baseUrl}/evento/${e.id}`,
      }));

    // Get contacts
    let contacts: { email: string }[] = [];
    try {
      const audienceContacts = await resend.contacts.list({ audienceId });
      if (audienceContacts.data?.data) {
        contacts = audienceContacts.data.data
          .filter((c) => !c.unsubscribed)
          .map((c) => ({ email: c.email }));
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      return NextResponse.json(
        { error: "Could not fetch audience contacts" },
        { status: 500 }
      );
    }

    if (contacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No contacts to send to",
        sent: 0,
      });
    }

    const emailHtml = buildMonthlyNewsletterEmail({
      month: monthDisplay,
      featured,
      exhibitions,
      lastDays,
    });

    let sentCount = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        await resend.emails.send({
          from: "YetzArt <onboarding@resend.dev>",
          to: [contact.email],
          subject: `${monthDisplay} — Arte en Barcelona`,
          html: emailHtml,
        });
        sentCount++;
      } catch (err) {
        errors.push(`${contact.email}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: contacts.length,
      errors: errors.length > 0 ? errors : undefined,
      month: monthDisplay,
    });
  } catch (err) {
    console.error("Newsletter send error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
