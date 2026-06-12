import { prisma } from '../prisma.js';
import { JWT_SECRET, GOOGLE_CLIENT_ID } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { RegisterDTO, LoginDTO } from './auth.types.js';
import { OAuth2Client } from "google-auth-library";
import { handle2FA } from '../utils/2fa.js';
import { pendingRegistrations, pending2FA } from '../utils/storage.js';
import { sendVerificationCode } from '../utils/mailer.js';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export const register = async (data: RegisterDTO) => {
  const { email, username, password } = data;

  if (!email || !username || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new AppError('Email already exists', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new AppError('Username already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const code = Math.floor(100000 + Math.random() * 900000).toString();

  pendingRegistrations.set(email, {
    email,
    username,
    hashedPassword,
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendVerificationCode(email, code);

  const tempToken = jwt.sign(
    {
      email,
      type: "email_verification",
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  return {
    requires_verification: true,
    temp_token: tempToken,
  };
}

export const verifyEmail = async (tempToken: string, code: string) => {
  if (!tempToken || !code) {
    throw new AppError("Missing required fields", 400);
  }
  
  let payload: any;

  try {
    payload = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 400);
  }

  if (payload.type !== "email_verification") {
    throw new AppError("Invalid token", 400);
  }

  const pending = pendingRegistrations.get(payload.email);

  if (!pending) {
    throw new AppError("Verification expired", 400);
  }

  if (pending.code !== code) {
    throw new AppError("Invalid code", 400);
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: pending.username },
  });

  if (existingUsername) {
    throw new AppError("Username already exists", 400);
  }

  const user = await prisma.user.create({
    data: {
      email: pending.email,
      username: pending.username,
      password_hash: pending.hashedPassword,
    },
  });

  pendingRegistrations.delete(payload.email);

  const token = jwt.sign({id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    token,
  };
};

export const checkEmail = async (email: string) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  return { exists: !!user };
};

export const login = async (data: LoginDTO) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new AppError('Missing required fields', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid password', 401);
  }

  if (user.two_factor_enabled) {
    return await handle2FA(user);
  }

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};

export const verify2FA = async (tempToken: string, code: string) => {
  if (!tempToken || !code) {
    throw new AppError("Missing required fields", 400);
  }

  let payload: any;

  try {
    payload = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 400);
  }

  if (payload.type !== "2fa") {
    throw new AppError("Invalid token", 400);
  }

  const pending = pending2FA.get(payload.userId);

  if (!pending) {
    throw new AppError("2FA expired", 400);
  }

  if (pending.code !== code) {
    throw new AppError("Invalid code", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  pending2FA.delete(payload.userId);

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    token,
  };
};

export const googleLogin = async (credential: string) => {
  if (!credential) {
    throw new AppError("Missing credential", 400);
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new AppError("Invalid Google account", 400);
  }

  const email = payload.email;
  const name = payload.name || "user";

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    let username = name.replace(/\s+/g, "_");

    let counter = 1;
    while (
      await prisma.user.findUnique({
        where: { username },
      })
    ) {
      username = `${name}_${counter++}`;
    }

    user = await prisma.user.create({
      data: {
        email,
        username,
        password_hash: "",
      },
    });
  }

  if (user.two_factor_enabled) {
    return await handle2FA(user);
  }

  const token = jwt.sign({ id: user.id, type: "auth" }, JWT_SECRET);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    token,
  };
};
