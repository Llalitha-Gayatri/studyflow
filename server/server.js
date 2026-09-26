import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyFlow API',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Priority list for fallback if any model encounters rate limits or temporary downtime
const MODEL_CANDIDATES = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
];

const ALLOWED_COUNTS = [5, 8, 10, 15];

app.post('/api/generate', async (req, res) => {
  try {
    const { input, count } = req.body;

    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({
        error: 'Enter a topic or paste some notes to get started.',
      });
    }

    const parsedCount = parseInt(count, 10);
    const targetCount = ALLOWED_COUNTS.includes(parsedCount) ? parsedCount : 10;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in backend .env file.',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a study assistant that converts user topics or notes into interactive flashcards.
Generate exactly ${targetCount} high-quality flashcards based on the user's input.
Each card must test a core concept, key term, mechanism, or definition.
The 'question' must be direct and clear.
The 'answer' must be accurate, comprehensive yet concise.

CRITICAL JSON CONTRACT:
You must output ONLY raw valid JSON conforming exactly to this structure:
{
  "topic": "Concise Topic Name",
  "cards": [
    {
      "id": 1,
      "question": "What is ...?",
      "answer": "..."
    }
  ]
}

STRICT RULES:
1. Output ONLY parseable JSON with exactly ${targetCount} cards in the "cards" array.
2. DO NOT include markdown code blocks or fences (no \`\`\` or \`\`\`json).
3. DO NOT include introductory or conversational remarks.
4. DO NOT include any text before or after the JSON object.`;

    const rawInput = input.trim();
    const cleanedTopic = rawInput.replace(/^(generate|create)\s+(\d+\s+)?flashcards\s+(about|for|on)?\s*/i, '');
    const userPrompt = `Generate exactly ${targetCount} flashcards about ${cleanedTopic || rawInput}.`;

    let lastError = null;
    let responseText = '';

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        responseText = response.text?.trim() || '';
        if (responseText) {
          lastError = null;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next candidate:`, err.message?.slice(0, 100));
      }
    }

    if (!responseText) {
      console.error('All Gemini model candidates failed:', lastError);
      return res.status(502).json({
        error: 'Unable to reach AI services right now. Please try again in a few moments.',
      });
    }

    let parsedResult;
    try {
      // Strip markdown code fences if model accidentally wrapped output
      const cleaned = responseText
        .replace(/^```(json)?/i, '')
        .replace(/```$/i, '')
        .trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse Gemini JSON output:', responseText);
      return res.status(502).json({
        error: 'We received an unexpected response format. Please try again.',
      });
    }

    if (!parsedResult || typeof parsedResult !== 'object' || !Array.isArray(parsedResult.cards) || parsedResult.cards.length === 0) {
      return res.status(502).json({
        error: 'We received an incomplete response format from AI. Please try again.',
      });
    }

    return res.json(parsedResult);
  } catch (error) {
    console.error('Server error generating flashcards:', error);
    const errorMessage = error?.message || 'Something went wrong while generating your cards.';
    return res.status(500).json({ error: errorMessage });
  }
});

// Serve frontend production build in single-service deployment
const distPath = path.resolve(__dirname, '../dist');
const indexPath = path.join(distPath, 'index.html');

app.use(express.static(distPath));

app.get('{*splat}', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('StudyFlow frontend build not found. Run "npm run build" first.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyFlow backend server running on http://0.0.0.0:${PORT}`);
});
