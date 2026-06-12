type PendingRegistration = {
  email: string;
  username: string;
  hashedPassword: string;
  code: string;
  expiresAt: number;
};

type Pending2FA = {
  userId: number;
  code: string;
  expiresAt: number;
};

export const pendingRegistrations = new Map<string, PendingRegistration>();
export const pending2FA = new Map<number, Pending2FA>();

setInterval(() => {
  const now = Date.now();

  for (const [email, data] of pendingRegistrations.entries()) {
    if (data.expiresAt < now) {
      pendingRegistrations.delete(email);
    }
  }

  for (const [userId, data] of pending2FA.entries()) {
    if (data.expiresAt < now) {
      pending2FA.delete(userId);
    }
  }
}, 60_000);
