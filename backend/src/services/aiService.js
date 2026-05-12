const OpenAI = require('openai');
const natural = require('natural');
const config = require('../config/constants');

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Sample responses for common queries
const faqResponses = {
  'how to submit complaint': 'To submit a complaint, login to your account, go to the Complaint Submission page, fill in the title, description, select category and priority, then click Submit.',
  'complaint status': 'You can track your complaint status from the dashboard under "My Complaints" section. Each complaint has a timeline showing its progress.',
  'escalation': 'If your complaint is not resolved within the specified timeframe, it will be automatically escalated to higher authorities.',
  'timeline': 'Standard resolution timeline is 7 days for medium priority and 3 days for high priority complaints.',
  'appeal': 'If your complaint is rejected, you can request an appeal by contacting the grievance committee.',
  'anonymous': 'Complaints cannot be submitted anonymously for accountability, but your identity is protected.',
  'attachment': 'You can attach images, PDFs, and documents up to 5MB in size.',
  'contact': 'For urgent matters, contact the grievance cell at grievance@college.edu or visit the administrative office.'
};

// AI Complaint Categorization
const aiCategorizeComplaint = async (description) => {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a complaint categorization system. Categorize the complaint into one of: academic, examination, faculty, hostel, infrastructure, administrative, library, transport, other. Return only the category name."
          },
          {
            role: "user",
            content: description
          }
        ],
        temperature: 0.3,
        max_tokens: 20
      });
      
      return response.choices[0].message.content.trim().toLowerCase();
    } catch (error) {
      console.error('OpenAI API error:', error);
      return fallbackCategorize(description);
    }
  }
  return fallbackCategorize(description);
};

// Fallback NLP categorization
const fallbackCategorize = (text) => {
  const lowerText = text.toLowerCase();
  
  const categories = {
    academic: ['assignment', 'course', 'syllabus', 'curriculum', 'class', 'lecture', 'grade', 'marks'],
    examination: ['exam', 'test', 'mid-term', 'final', 'cheating', 'paper', 'question', 'result'],
    faculty: ['teacher', 'professor', 'instructor', 'mentor', 'behavior', 'attitude', 'discrimination'],
    hostel: ['room', 'mess', 'food', 'hostel', 'accommodation', 'wifi', 'water', 'electricity'],
    infrastructure: ['building', 'lab', 'library', 'facility', 'maintenance', 'cleanliness', 'repair'],
    administrative: ['fee', 'admission', 'document', 'certificate', 'registration', 'scholarship'],
    library: ['book', 'journal', 'reading', 'membership', 'library', 'silence'],
    transport: ['bus', 'vehicle', 'transport', 'parking', 'commute', 'shuttle']
  };
  
  let bestMatch = 'other';
  let maxScore = 0;
  
  for (const [category, keywords] of Object.entries(categories)) {
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) score++;
    });
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }
  
  return bestMatch;
};

// AI Chatbot
const aiChatbot = async (message, userContext) => {
  // Check for FAQ matches first
  const lowerMsg = message.toLowerCase();
  for (const [key, response] of Object.entries(faqResponses)) {
    if (lowerMsg.includes(key)) {
      return response;
    }
  }
  
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a College Grievance Management System. Help students with complaint submission, tracking, escalation process, and college policies. Be helpful, professional, and concise. User role: ${userContext.role}`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I'm having trouble connecting to my knowledge base. Please contact the grievance cell directly for assistance.";
    }
  }
  
  return "I'm an AI assistant that can help with common queries. Please ask about complaint submission, tracking, or college policies.";
};

// Smart response generation for complaints
const generateResponse = async (complaint) => {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Generate a professional response for this college complaint."
          },
          {
            role: "user",
            content: `Complaint: ${complaint.title}\nDescription: ${complaint.description}\nCategory: ${complaint.category}`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "Thank you for your complaint. Our team will review it and get back to you shortly.";
    }
  }
  
  return "Thank you for your complaint. Our team will review it and get back to you shortly.";
};

module.exports = {
  aiCategorizeComplaint,
  aiChatbot,
  generateResponse
};
