import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY.trim() !== '',
    );
    res.json({ ok: true, aiConfigured: hasKey, model: MODEL_NAME });
  });

  app.post('/api/ai/grammar', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Gemini API key is not configured on the server. Using instant local engine.',
      });
    }

    const { module, input, direction, bilingual } = req.body ?? {};
    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Input text is required.' });
    }

    try {
      const prompt = `You are an expert English and Bengali grammar teacher.
Task module: ${String(module || 'narration')}
Direction/Mode: ${String(direction || 'auto')}
Input: ${input.trim()}

Return accurate grammatical transformation and concise rule breakdown.
${bilingual ? 'Include clear Bengali (বাংলা) explanations alongside English explanations.' : 'Provide clear English explanations (plus optional short Bengali notes if helpful).'}`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              converted: { type: Type.STRING, description: 'The transformed sentence or result.' },
              detectedLabel: { type: Type.STRING, description: 'Detected grammar type or tense label.' },
              detectedLabelBn: { type: Type.STRING, description: 'Bengali label for detected type.' },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    labelBn: { type: Type.STRING },
                    before: { type: Type.STRING },
                    after: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    explanationBn: { type: Type.STRING },
                  },
                },
              },
            },
            required: ['converted', 'detectedLabel'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json({ ok: true, data: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process grammar with Gemini.';
      return res.status(502).json({ error: 'GEMINI_ERROR', message });
    }
  });

  app.post('/api/ai/morpheme', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Gemini API key is not configured on the server. Using instant local engine.',
      });
    }

    const { word, bilingual } = req.body ?? {};
    if (typeof word !== 'string' || word.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Word is required.' });
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze the English word "${word.trim()}" for prefixes and suffixes.
Provide ONLY real, standard dictionary-valid prefixes and suffixes that attach to its root word.
${bilingual ? 'Include short Bengali (বাংলা) meanings for each prefix, suffix, and root.' : ''}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              root: { type: Type.STRING },
              rootPos: { type: Type.STRING },
              rootMeaningEn: { type: Type.STRING },
              rootMeaningBn: { type: Type.STRING },
              prefixes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    affix: { type: Type.STRING },
                    resultWord: { type: Type.STRING },
                    pos: { type: Type.STRING },
                    meaningEn: { type: Type.STRING },
                    meaningBn: { type: Type.STRING },
                  },
                },
              },
              suffixes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    affix: { type: Type.STRING },
                    resultWord: { type: Type.STRING },
                    pos: { type: Type.STRING },
                    meaningEn: { type: Type.STRING },
                    meaningBn: { type: Type.STRING },
                  },
                },
              },
            },
            required: ['root', 'prefixes', 'suffixes'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json({ ok: true, data: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to look up affixes with Gemini.';
      return res.status(502).json({ error: 'GEMINI_ERROR', message });
    }
  });

  app.post('/api/ai/write', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Gemini API key is not configured on the server.',
      });
    }

    const { kind, topic, tone, length, customCount, speakers, bilingual } = req.body ?? {};
    if (typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Topic is required.' });
    }

    const parsedCustom =
      typeof customCount === 'number' && Number.isFinite(customCount) && customCount > 0
        ? Math.round(customCount)
        : null;

    const lengthGuide =
      length === 'Custom' && parsedCustom
        ? kind === 'dialogue'
          ? `EXACTLY ${parsedCustom} lines of dialogue`
          : `EXACTLY ${parsedCustom} words`
        : length === 'Short'
          ? kind === 'dialogue'
            ? '6 lines of dialogue'
            : 'around 110-140 words'
          : length === 'Detailed'
            ? kind === 'dialogue'
              ? '14 lines of dialogue'
              : 'around 260-340 words'
            : kind === 'dialogue'
              ? '10 lines of dialogue'
              : 'around 170-220 words';

    const formatGuide =
      kind === 'dialogue'
        ? `Write a natural, well-structured dialogue between ${String(speakers || 'Rakib & Abdullah')}. Format every turn strictly as "Speaker: line" on its own line (no blank lines, no intro/outro text). ${
            parsedCustom && length === 'Custom'
              ? `You MUST output exactly ${parsedCustom} lines.`
              : ''
          }`
        : kind === 'composition'
          ? `Write a multi-paragraph essay/composition separated by blank lines. ${
              parsedCustom && length === 'Custom'
                ? `Match the exact target length of ${parsedCustom} words as closely as possible.`
                : ''
            }`
          : `Write a cohesive, high-scoring single paragraph without bullet points. ${
              parsedCustom && length === 'Custom'
                ? `Match the exact target length of ${parsedCustom} words as closely as possible.`
                : ''
            }`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Topic: ${topic.trim()}
Kind: ${String(kind || 'paragraph')}
Tone: ${String(tone || 'Exam Standard')}
Target Length: ${lengthGuide}
${formatGuide}
${bilingual ? 'Also provide a short Bengali summary/key vocabulary note.' : ''}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              body: { type: Type.STRING },
              keyPhrases: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              bengaliNote: { type: Type.STRING },
            },
            required: ['title', 'body'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json({ ok: true, data: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate writing with Gemini.';
      return res.status(502).json({ error: 'GEMINI_ERROR', message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Grammar & Writing Studio server listening on http://localhost:${PORT}`);
  });
}

createApp();
