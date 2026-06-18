import axios from "axios";

export const sendEmail = async (
  to,
  subject,
  text,
  html = null
) => {
  try {
    if (!to?.trim()) {
      throw new Error("Recipient email is required");
    }

    if (!process.env.PROMAILER_API_KEY) {
      throw new Error("PROMAILER_API_KEY is missing");
    }

    const payload = {
      to: to.trim(),
      subject,
      text,
      html: html || `<p>${text}</p>`,
      smtpId: process.env.SMTP_CONNECTION_ID,
    };

    const response = await axios.post(
      "https://mailserver.automationlounge.com/api/v1/messages/send",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PROMAILER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    console.log("✅ Email Sent:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "❌ ProMailer Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};