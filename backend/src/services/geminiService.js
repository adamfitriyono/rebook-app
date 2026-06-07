const { GoogleGenerativeAI } = require('@google/generative-ai');
const knowledge = require('../config/supportKnowledge');

const MAX_HISTORY = 10;

function isConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function buildSystemPrompt(userContext) {
  const faqText = knowledge.faq
    .map((item) => `- Q: ${item.q}\n  A: ${item.a}`)
    .join('\n');

  const policies = knowledge.policies.map((p) => `- ${p}`).join('\n');

  let userLine = '';
  if (userContext?.fullName) {
    userLine = `\nPengguna saat ini: ${userContext.fullName} (role: ${userContext.role || 'buyer'}).`;
  }

  return `Kamu adalah asisten Customer Service untuk ${knowledge.brand.name} — ${knowledge.brand.tagline}.
Jam operasional CS manusia: ${knowledge.brand.hours}
Email: ${knowledge.brand.email} | Telepon: ${knowledge.brand.phone} | WhatsApp: ${knowledge.brand.whatsapp}
${userLine}

Knowledge base FAQ:
${faqText}

Kebijakan:
${policies}`;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const normalized = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content.trim() }],
    }));

  // Gemini requires history to start with a user message
  while (normalized.length > 0 && normalized[0].role === 'model') {
    normalized.shift();
  }

  return normalized;
}

async function chat({ message, history = [], userContext = null }) {
  if (!isConfigured()) {
    const err = new Error('Gemini API is not configured');
    err.statusCode = 503;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction: buildSystemPrompt(userContext),
  });

  const chatHistory = normalizeHistory(history);
  const chatSession = model.startChat({ history: chatHistory });

  const result = await chatSession.sendMessage(message.trim());
  const reply = result.response.text();

  if (!reply) {
    const err = new Error('Empty response from Gemini');
    err.statusCode = 502;
    throw err;
  }

  return reply.trim();
}

module.exports = { chat, isConfigured };
