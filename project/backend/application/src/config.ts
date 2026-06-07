import 'dotenv/config';

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined`);
  }
  return value;
}

export const JWT_SECRET = getEnv('JWT_SECRET');
export const DATABASE_URL = getEnv('DATABASE_URL');
export const SMTP_EMAIL = getEnv("SMTP_EMAIL");
export const SMTP_PASSWORD = getEnv("SMTP_PASSWORD");
