import { JWT_SECRET } from '../config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

type User = {
  id: string;
  email: string;
  username: string;
  password: string;
};

const users: User[] = [];

export const register = async ({
  email,
  username,
  password,
}: {
  email: string;
  username: string;
  password: string;
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user: User = {
    id: Date.now().toString(),
    email,
    username,
    password: hashedPassword,
  };

  users.push(user);

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return {
    user: { id: user.id, email, username },
    token,
  };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = users.find((u) => u.email === email);

  if (!user) {
    throw new Error('User not found');
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
};