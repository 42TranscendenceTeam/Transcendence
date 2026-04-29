const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  try {
    // 1. ir buscar token ao header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // 2. formato: "Bearer token"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // 3. validar token
    const decoded = jwt.verify(token, SECRET);

    // 4. guardar info do user no request
    req.user = decoded;

    // 5. continuar para a rota
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authMiddleware;