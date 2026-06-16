import { generateChatReply } from '../services/aiService.js';
import ChatHistory from '../models/ChatHistory.js';

// @desc    Process chatbot messages
// @route   POST /api/chat
// @access  Private
const processMessage = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Please provide a message' });
  }

  try {
    const reply = await generateChatReply(req.user, message);

    // Save conversation to database
    await ChatHistory.create({
      user: req.user._id,
      message,
      reply,
    });

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

export { processMessage };
