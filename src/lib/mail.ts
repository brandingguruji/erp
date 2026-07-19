import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  // If SMTP is not configured, we'll log it instead of crashing.
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not found in .env. Email is simulated.");
    console.log(`[Simulated Email to ${to}] Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"Brandingguruji LLP" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId, simulated: false };
}
