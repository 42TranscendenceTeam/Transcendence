import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { send2FACode } from "./mailer.js";
import type { User } from "@prisma/client";
import { pending2FA } from "./storage.js";

export const handle2FA = async (user: User) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await send2FACode(user.email, code);

  pending2FA.set(user.id, {
    userId: user.id,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  const tempToken = jwt.sign(
    {
      userId: user.id,
      type: "2fa",
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  return {
    requires_2fa: true,
    temp_token: tempToken,
  };
};
