const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiChatbot, generateResponse } = require('../services/aiService');

router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await aiChatbot(message, { role: req.user.role });
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/suggest-response', protect, async (req, res) => {
  try {
    const { complaint } = req.body;
    const response = await generateResponse(complaint);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
