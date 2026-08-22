export async function sendOtpEmail(to: string, code: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) throw new Error('RESEND_API_KEY and RESEND_FROM_EMAIL are required');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Your RUMGIP LIVE verification code',
      text: `Your RUMGIP LIVE verification code is ${code}. It expires in 10 minutes. If you did not request this code, ignore this email.`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5"><h2>RUMGIP LIVE</h2><p>Your verification code:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`
    })
  });
  if (!res.ok) throw new Error(`Resend error: ${res.status}`);
}
