interface EventSummary {
  title: string;
  venue: string;
  dates: string;
  price: string;
  url: string;
}

interface MonthlyNewsletterProps {
  month: string;
  featured: EventSummary[];
  exhibitions: EventSummary[];
  lastDays: EventSummary[];
}

function eventRow(event: EventSummary): string {
  return `
    <div style="padding:16px 0;border-bottom:1px solid #f5f5f5">
      <a href="${event.url}" style="font-size:16px;font-weight:600;color:#111;text-decoration:none;letter-spacing:-0.01em">${event.title}</a>
      <p style="margin:4px 0 0;font-size:13px;font-weight:300;color:#888">${event.venue}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px"><tr>
        <td style="font-size:12px;color:#aaa;font-weight:300">${event.dates}</td>
        <td style="font-size:13px;color:#111;font-weight:500;text-align:right">${event.price}</td>
      </tr></table>
    </div>`;
}

function section(color: string, title: string, events: EventSummary[]): string {
  if (events.length === 0) return "";
  return `
  <tr><td style="padding:8px 40px 24px">
    <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#111;text-transform:uppercase;letter-spacing:0.2em">
      <span style="color:${color};margin-right:8px">—</span>${title}
    </p>
    ${events.map(eventRow).join("")}
  </td></tr>`;
}

export function buildMonthlyNewsletterEmail(props: MonthlyNewsletterProps): string {
  const { month, featured, exhibitions, lastDays } = props;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 0;background:#f7f7f7;font-family:Georgia,'Times New Roman',serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">

  <!-- Header -->
  <tr><td style="text-align:center;padding:40px 40px 24px">
    <p style="margin:0;font-size:28px;color:#111;letter-spacing:-0.02em">
      <span style="font-style:italic;font-weight:300">Yetz</span><span style="font-weight:200">Art</span>
    </p>
    <p style="margin:6px 0 0;font-size:9px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:0.35em">Barcelona</p>
  </td></tr>

  <!-- Rainbow accent -->
  <tr><td><div style="height:3px;background:linear-gradient(90deg,#c8a96e,#eab308,#dc2626,#2563eb);border-radius:2px"></div></td></tr>

  <!-- Month title -->
  <tr><td style="text-align:center;padding:40px 40px 12px">
    <p style="margin:0 0 8px;font-size:10px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.3em">Boletín mensual</p>
    <p style="margin:0 0 8px;font-size:32px;font-weight:300;font-style:italic;color:#111;letter-spacing:-0.02em">${month}</p>
    <p style="margin:0;font-size:14px;font-weight:300;color:#888">Lo mejor de la pintura y el arte en Barcelona</p>
  </td></tr>

  ${section("#c8a96e", "Destacados del mes", featured)}
  ${section("#2563eb", "Exposiciones", exhibitions)}
  ${section("#dc2626", "Últimos días", lastDays)}

  <!-- CTA -->
  <tr><td style="text-align:center;padding:16px 40px 40px">
    <a href="https://artmatch-gamma.vercel.app" style="display:inline-block;background:#111;color:#fff;padding:14px 36px;border-radius:30px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.03em">Ver toda la agenda</a>
  </td></tr>

  <!-- Footer -->
  <tr><td><hr style="border:none;border-top:1px solid #eee;margin:0"></td></tr>
  <tr><td style="text-align:center;padding:28px 40px">
    <p style="margin:0 0 8px;font-size:15px;color:#111">
      <span style="font-style:italic;font-weight:300">Yetz</span><span style="font-weight:200">Art</span>
      <span style="display:inline-block;margin:0 10px;color:#ddd">|</span>
      <span style="font-size:9px;font-weight:600;color:#bbb;text-transform:uppercase;letter-spacing:0.2em">Barcelona</span>
    </p>
    <p style="margin:0;font-size:11px;color:#bbb;font-weight:300">Tu guía de pintura y arte, actualizada</p>
  </td></tr>

</table>
</td></tr></table>
</body>
</html>`;
}
