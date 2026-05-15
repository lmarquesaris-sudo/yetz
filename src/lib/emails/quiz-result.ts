import type { PainterProfile } from "@/lib/quiz-data";

export function buildQuizResultEmail(painter: PainterProfile): string {
  const c = painter.color;
  const traits = painter.traits
    .map(
      (t) =>
        `<span style="display:inline-block;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:500;border:1px solid ${c}60;color:${c};letter-spacing:0.02em;margin-right:6px;margin-bottom:6px">${t}</span>`
    )
    .join("");

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

  <!-- Accent bar -->
  <tr><td><div style="height:3px;background:${c};border-radius:2px"></div></td></tr>

  <!-- Result title -->
  <tr><td style="text-align:center;padding:40px 40px 24px">
    <p style="margin:0 0 16px;font-size:10px;font-weight:600;color:#999;text-transform:uppercase;letter-spacing:0.3em">Tu match artístico</p>
    <p style="margin:0;font-size:36px;font-weight:300;color:#111;letter-spacing:-0.03em;line-height:1.2">
      Eres <span style="color:${c};font-style:italic">${painter.name}</span>
    </p>
  </td></tr>

  <!-- Painter info -->
  <tr><td style="padding:8px 40px 32px">
    <p style="margin:0 0 4px;font-size:20px;font-weight:600;color:#111;letter-spacing:-0.01em">${painter.fullName}</p>
    <p style="margin:0;font-size:13px;color:#888;font-weight:300">${painter.years} · ${painter.movement}</p>

    <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0">

    <div style="border-left:2px solid #ddd;padding-left:20px">
      <p style="margin:0;font-size:16px;color:#555;font-style:italic;font-weight:300;line-height:1.7">&ldquo;${painter.quote}&rdquo;</p>
    </div>

    <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0">

    <p style="margin:0;font-size:15px;color:#555;font-weight:300;line-height:1.8">${painter.description}</p>

    <div style="margin-top:24px">${traits}</div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="text-align:center;padding:16px 40px 40px">
    <a href="https://artmatch-gamma.vercel.app/quiz" style="display:inline-block;background:#111;color:#fff;padding:14px 36px;border-radius:30px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.03em">Repetir el quiz</a>
    <p style="font-size:13px;color:#aaa;font-weight:300;margin-top:16px">
      o <a href="https://artmatch-gamma.vercel.app" style="color:#666;text-decoration:underline">explora la agenda cultural de Barcelona</a>
    </p>
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
