import nodemailer from "nodemailer";
import { SMTP_EMAIL, SMTP_PASSWORD } from "../config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_EMAIL,
    pass: SMTP_PASSWORD,
  },
});

export const send2FACode = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"Transcendence" <${SMTP_EMAIL}>`,
    to: email,
    subject: "Your 2FA Code",
    html: `
      <h3>Your verification code is:</h3>
      <h1>${code}</h1>
      <p><em>This code expires in 5 minutes.</em></p>
    `,
  });
};

export const sendVerificationCode = async (email: string, code: string) => {
  await transporter.sendMail({
    from: `"Transcendence" <${SMTP_EMAIL}>`,
    to: email,
    subject: "Your Registration Code",
    html: `
      <h3>Your registration code is:</h3>
      <h1>${code}</h1>
      <p><em>This code expires in 5 minutes.</em></p>
    `,
  });
}
