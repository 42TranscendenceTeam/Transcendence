import { Resend } from "resend";
import { RESEND_API_KEY } from "../config.js";

const resend = new Resend(RESEND_API_KEY);

export const send2FACode = async (email: string, code: string) => {
  await resend.emails.send({
    from: "Transcendence <onboarding@resend.dev>",
    to: email,
    subject: "Your 2FA Code",
    html: `<p>Your login code is: <strong>${code}</strong></p>`,
  });
};
