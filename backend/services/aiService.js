import { GoogleGenerativeAI } from '@google/generative-ai';
import Book from '../models/Book.js';
import BorrowRecord from '../models/BorrowRecord.js';

// Get generative model if key exists
const getGenerativeModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (err) {
    console.error('Failed to initialize Gemini API:', err.message);
    return null;
  }
};

/**
 * Generate AI chatbot replies
 */
const generateChatReply = async (user, message) => {
  const model = getGenerativeModel();
  const lowerMessage = message.toLowerCase();

  // Fetch some catalog items and user history to inject context
  const books = await Book.find({}).limit(5).select('title author category');
  const activeBorrows = await BorrowRecord.find({ user: user._id, status: 'borrowed' }).populate('book', 'title dueDate');

  const contextInfo = {
    userName: user.name,
    userRole: user.role,
    activeBorrows: activeBorrows.map(b => ({ title: b.book.title, dueDate: b.dueDate })),
    availableBooksSample: books.map(b => `${b.title} by ${b.author}`),
  };

  if (model) {
    try {
      const prompt = `
        You are a helpful and polite AI Library Assistant for "SmartLibrary". 
        User Info: ${JSON.stringify(contextInfo)}
        User Message: "${message}"

        Respond to the user naturally and concisely. You have access to user borrow history and library books sample above. 
        If the user asks to search or find books, check the sample or tell them to search in the catalog.
        If they ask about due dates or returned books, reference their active borrows.
        Do not output JSON, return plain text. Keep it friendly.
      `;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini Chat Error:', error.message);
      // Fallback to simulation on API error
    }
  }

  // High-Fidelity Simulation Fallback
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hi ${user.name}! I am your AI Library Assistant. How can I help you today? You can ask me for book recommendations, explain library rules, or check your active loans!`;
  }

  if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('book')) {
    const term = lowerMessage.replace('find', '').replace('search', '').replace('book', '').replace('me', '').trim();
    if (!term) {
      return `I would love to help you find books. Try asking me "Find machine learning books" or check out our Library Catalog!`;
    }
    const matches = await Book.find({
      $or: [
        { title: { $regex: term, $options: 'i' } },
        { author: { $regex: term, $options: 'i' } }
      ]
    }).limit(3);

    if (matches.length > 0) {
      return `I found some matches in our database: ${matches.map(m => `"${m.title}" by ${m.author}`).join(', ')}. You can search for them in the main catalog tab to borrow them immediately!`;
    }
    return `I couldn't find any books matching "${term}" in our catalog sample, but you can try searching other keywords in the Search bar above!`;
  }

  if (lowerMessage.includes('due') || lowerMessage.includes('my books') || lowerMessage.includes('return') || lowerMessage.includes('loan')) {
    if (activeBorrows.length > 0) {
      const list = activeBorrows.map(b => `"${b.book.title}" (Due: ${new Date(b.dueDate).toLocaleDateString()})`).join(', ');
      return `You currently have ${activeBorrows.length} active book loan(s): ${list}. Remember to return them before the due date to avoid fines!`;
    }
    return `You don't have any books checked out at the moment. Explore our catalog to find your next read!`;
  }

  if (lowerMessage.includes('fine') || lowerMessage.includes('rule') || lowerMessage.includes('policy')) {
    return `SmartLibrary rules are simple:\n- Standard checkout time is 14 days.\n- Overdue books incur a fine of $1.00 per day.\n- You can renew active checkouts once if no other user has reserved the book.`;
  }

  // General knowledge simulation
  return `That's an interesting question about "${message}". As a library assistant, I recommend checking our catalog for academic textbooks or guides on this subject. Let me know if you want to find a book!`;
};

/**
 * Generate AI book summaries
 */
const generateBookSummary = async (bookTitle, bookAuthor, bookDescription) => {
  const model = getGenerativeModel();

  if (model) {
    try {
      const prompt = `
        Summarize the book "${bookTitle}" by ${bookAuthor}.
        Description: ${bookDescription || 'No description provided.'}
        
        Provide a concise, engaging summary in 3-4 paragraphs.
        Include:
        1. An overview of the main plot or core thesis.
        2. Key takeaways or themes.
        3. Who should read this book.
        
        Format as plain text with line breaks, no markdown headers.
      `;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini Summary Error:', error.message);
    }
  }

  // Simulation Fallback
  return `### AI Summary: "${bookTitle}" by ${bookAuthor}

**Overview:**
This is an automated summary for "${bookTitle}" by ${bookAuthor}. This book serves as an insightful exploration of its subject matter, detailing core frameworks, practical applications, and theoretical concepts.

**Key Takeaways:**
1. Deep understanding of structural concepts related to ${bookTitle}.
2. Practical methods for executing tasks and projects in this field.
3. Strategies for integrating these practices into standard industry pipelines.

**Target Audience:**
Ideal for students, professionals, and anyone wishing to deepen their knowledge of this subject.`;
};

export { generateChatReply, generateBookSummary };
