import nodemailer from "nodemailer";

// In-memory OTP storage for validation
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function sendOtpEmail(toEmail: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: "ns1.sslsecure.co.in",
    port: 465,
    secure: true,
    name: "smartsolutions.co.in",
    auth: {
      user: "care@smartsolutions.co.in",
      pass: "1AnzkrF0Gu6Wx",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@smartsolutions.co.in>`;

  const info = await transporter.sendMail({
    from: '"Smart Solutions" <care@smartsolutions.co.in>',
    to: toEmail,
    replyTo: "care@smartsolutions.co.in",
    envelope: {
      from: "care@smartsolutions.co.in",
      to: toEmail,
    },
    messageId,
    date: new Date(),
    subject: `Your Smart Solutions verification code is ${code}`,
    text: `Hello,

Your verification code is: ${code}

Please enter this code on the Smart Solutions login page to continue. This code will expire in 10 minutes.

If you did not request this verification code, please ignore this email.

Best regards,
Smart Solutions Team
care@smartsolutions.co.in
https://smartsolutions.co.in`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Smart Solutions Verification Code</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px;">
    <tr>
      <td>
        <h2 style="font-size: 20px; font-weight: 700; color: #0b2e59; margin: 0 0 16px 0;">
          Smart Solutions
        </h2>
        <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 16px 0;">
          Hello,
        </p>
        <p style="font-size: 15px; line-height: 24px; color: #334155; margin: 0 0 20px 0;">
          Your one-time verification code to log into your account is:
        </p>
        <div style="background-color: #f1f5f9; border-radius: 6px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0b2e59;">
            ${code}
          </span>
        </div>
        <p style="font-size: 14px; line-height: 22px; color: #64748b; margin: 0 0 24px 0;">
          This code is valid for 10 minutes. If you did not request this code, no action is needed and you can safely disregard this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; line-height: 18px; color: #64748b; margin: 0;">
          Smart Solutions &bull; <a href="https://smartsolutions.co.in" style="color: #0b2e59; text-decoration: none;">smartsolutions.co.in</a> &bull; <a href="mailto:care@smartsolutions.co.in" style="color: #64748b; text-decoration: none;">care@smartsolutions.co.in</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  return info;
}
