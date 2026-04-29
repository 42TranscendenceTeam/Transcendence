const authService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};