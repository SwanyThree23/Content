import fetch from 'node-fetch';

export async function sendEmail({ to, subject, template, data }: any) {
  const templates: Record<string, string> = {
    welcome: `<h1>Welcome to SwanyBot Live!</h1><p>Your account is ready.</p>`,
    payment_success: `<h1>Payment Successful</h1><p>Amount: $${data.amount}</p>`
  };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'SwanyBot <noreply@swanybot.com>',
      to,
      subject,
      html: templates[template]
    })
  });
}
