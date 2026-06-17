import nodemailer from "nodemailer";

let transporter;

export const sendEmail = async (to, subject, text, html = null) => {
  if (!to?.trim()) {
    throw new Error("Recipient email is required");
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is missing");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      pool: true,             // Tani waxay furaysaa marin joogto ah si looga badbaado timeout
      host: "smtp.gmail.com", 
      port: 465,             
      secure: true,         // Waa false marka la isticmaalayo Port 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
      tls: {
        rejectUnauthorized: false, 
      },
    });
  }

  try {
    console.log("📨 Sending email via Gmail Pool (Port 587)...");
    console.log("TO:", to);

    const info = await transporter.sendMail({
      from: `"BAAFIN SYSTEM" <${process.env.EMAIL_USER}>`,
      to: to.trim(),
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    console.log("✅ Email Sent Successfully");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error.message || error);
    throw new Error(`Email delivery failed: ${error.message || error}`);
  }
};