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
      host: "smtp.gmail.com",
      port: 465,
      secure: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      connectionTimeout: 60000,
      greetingTimeout: 60000,
      socketTimeout: 60000,
    });

    await transporter.verify();

    console.log("✅ Gmail SMTP Connected");
  }


  try {

    console.log("📨 Sending Gmail Email (Port 465)");
    console.log("TO:", to);


    const info = await transporter.sendMail({

      from: `"BAAFIN SYSTEM" <${process.env.EMAIL_USER}>`,

      to: to.trim(),

      subject,

      text,

      html: html || `<p>${text}</p>`,
    });


    console.log("✅ Email Sent:", info.messageId);

    return info;


  } catch (error) {

    console.error("❌ Gmail SMTP Error:", error);

    throw error;

  }
};