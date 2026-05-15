export function buildNewsletterWelcomeEmail(): string {
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

  <!-- Welcome -->
  <tr><td style="padding:40px 40px 16px;text-align:center">
    <p style="margin:0 0 16px;font-size:26px;font-weight:300;color:#111;letter-spacing:-0.02em;line-height:1.3">
      Bienvenido al boletín de <span style="font-style:italic">YetzArt</span>
    </p>
    <p style="margin:0;font-size:15px;font-weight:300;color:#666;line-height:1.7">
      Cada mes recibirás las exposiciones y eventos de pintura más destacados de Barcelona directamente en tu correo.
    </p>
  </td></tr>

  <!-- Content -->
  <tr><td style="padding:0 40px 40px">
    <p style="margin:0 0 12px;font-size:15px;font-weight:300;color:#555;line-height:1.8">En cada edición encontrarás:</p>
    <p style="margin:4px 0;font-size:14px;font-weight:300;color:#555;line-height:1.6;padding-left:8px">
      <span style="color:#c8a96e;font-weight:700;margin-right:10px;font-size:16px">·</span>
      Las exposiciones imprescindibles del mes
    </p>
    <p style="margin:4px 0;font-size:14px;font-weight:300;color:#555;line-height:1.6;padding-left:8px">
      <span style="color:#c8a96e;font-weight:700;margin-right:10px;font-size:16px">·</span>
      Inauguraciones y últimos días
    </p>
    <p style="margin:4px 0;font-size:14px;font-weight:300;color:#555;line-height:1.6;padding-left:8px">
      <span style="color:#c8a96e;font-weight:700;margin-right:10px;font-size:16px">·</span>
      Eventos destacados en MACBA, Miró, Picasso, MNAC y CaixaForum
    </p>
    <p style="margin:4px 0;font-size:14px;font-weight:300;color:#555;line-height:1.6;padding-left:8px">
      <span style="color:#c8a96e;font-weight:700;margin-right:10px;font-size:16px">·</span>
      Descubrimientos en galerías y espacios independientes
    </p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="text-align:center;padding:0 40px 40px">
    <a href="https://artmatch-gamma.vercel.app" style="display:inline-block;background:#111;color:#fff;padding:14px 36px;border-radius:30px;font-size:13px;font-weight:500;text-decoration:none;letter-spacing:0.03em">Explorar la agenda</a>
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
