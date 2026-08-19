const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Small helper so we don't repeat "get the model" in all four functions
const getModel = () => {
  return genAI.getGenerativeModel({
model: 'gemini-3.5-flash-lite'  });
};
// Explains a piece of code or answers a technical question, with project context
const explainCode = async (code, question) => {
  const model = getModel();

  const prompt = `You are a helpful coding assistant for student developers working on team projects. Explain clearly and simply, as if teaching a beginner.

Here is some code:
${code}

Question: ${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Suggests a fix for buggy code
const debugCode = async (code, errorDescription) => {
  const model = getModel();

  const prompt = `You are a debugging assistant. Identify the likely bug and suggest a specific fix with a short code example.

Code:
${code}

Problem: ${errorDescription}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Generates documentation/comments for a piece of code
const generateDocs = async (code) => {
  const model = getModel();

  const prompt = `You write clear, concise documentation for code. Include a short summary of what it does, its parameters/inputs, and its return value if applicable.

Document this code:
${code}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// Summarizes a list of recent chat messages from a project
const summarizeChat = async (messagesText) => {
  const model = getModel();

  const prompt = `You summarize team chat discussions concisely, highlighting decisions made and open questions.

Summarize this conversation:
${messagesText}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { explainCode, debugCode, generateDocs, summarizeChat };