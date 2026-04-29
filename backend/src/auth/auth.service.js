const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// simulação de DB (por agora)
const users = [];

const SECRET = process.env.JWT_SECRET;

exports.register = async ({ email, username, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    email,
    username,
    password: hashedPassword
  };

  users.push(user);

  const token = jwt.sign({ id: user.id }, SECRET);

  return { user: { id: user.id, email, username }, token };
};

exports.login = async ({ email, password }) => {
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid password");
  }

  const token = jwt.sign({ id: user.id }, SECRET);

  return { user: { id: user.id, email: user.email }, token };
};