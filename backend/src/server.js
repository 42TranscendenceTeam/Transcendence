require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth/auth.routes');

const app = express();
const PORT = 3000;

app.use(express.json());

// routes
app.use('/auth', authRoutes);

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
