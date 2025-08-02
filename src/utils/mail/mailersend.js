// src/utils/mail/mailersend.js
// This module sends a transactional email alert via the MailerSend API.

import 'dotenv/config';

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
const ALERT_RECIPIENT_EMAIL = process.env.ALERT_RECIPIENT_EMAIL;
const SENDER_EMAIL = process.env.MAILERSEND_SENDER_EMAIL || "system@example.com";

/**
 * Sends an email alert for failed login attempts.
 * @param {string} email - The email that had the failed attempts.
 * @returns {Promise<boolean>} A promise that resolves to true if the email was sent successfully, false otherwise.
 */
export async function sendFailedLoginAlert(email) {
  if (!MAILERSEND_API_KEY || !ALERT_RECIPIENT_EMAIL) {
    console.error("MailerSend API key or recipient email not set. Skipping email alert.");
    return false;
  }

  const payload = {
    from: {
      email: SENDER_EMAIL,
    },
    to: [
      {
        email: ALERT_RECIPIENT_EMAIL,
      },
    ],
    subject: "Security Alert: Multiple Failed Login Attempts",
    html: `
      <p>Hello,</p>
      <p>This is an automated security alert. We have detected three or more failed login attempts for the admin email address <b>${email}</b>.</p>
      <p>If this was not you, please take immediate action to secure your account.</p>
      <p>Best regards,<br>Your Blog Administration</p>
    `,
  };

  try {
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("Failed login alert email sent successfully.");
      return true;
    } else {
      const errorText = await response.text();
      console.error("Failed to send MailerSend email:", response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error("Error sending MailerSend email:", error);
    return false;
  }
}