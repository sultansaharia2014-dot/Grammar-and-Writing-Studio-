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

    const isFormalDialogue =
      kind === 'dialogue' &&
      /\b(bank|banker|manager|principal|headmaster|headmistress|teacher|professor|dean|doctor|physician|patient|officer|police|director|ceo|hr|interviewer|interview|passport|visa|embassy|librarian|customer|client|applicant|candidate|receptionist|cashier|clerk|lawyer|judge|landlord|boss|supervisor|employer|account|loan|complaint|appointment|admission|formal|official|sir|madam)\b/i.test(
        `${topic} ${speakers || ''}`,
      );

    const formatGuide =
      kind === 'dialogue'
        ? `Write a well-structured dialogue between ${String(speakers || 'Rakib & Abdullah')}. Format every turn strictly as "Speaker: line" on its own line (no blank lines, no stage directions, no intro/outro text). ${
            isFormalDialogue
              ? 'CRITICAL FORMAL REGISTER REQUIREMENT: This is a formal/official scenario. Strictly follow formal dialogue structure: begin with a courteous formal salutation and permission (e.g., "Good morning, Sir/Madam. May I come in?"), maintain respectful honorifics ("Sir", "Ma\'am", "Doctor") and polite official phrasing throughout, avoid all slang or casual friend banter ("Hey", "What is on your mind?", "I am doing great!"), discuss the purpose/procedures professionally, and end with a polite formal closing.'
              : 'Match the requested tone naturally and keep turns realistic.'
          } ${
            parsedCustom && length === 'Custom'
              ? `You MUST output exactly ${parsedCustom} lines.`
              : ''
          }`
        : kind === 'composition'
          ? `Write a clean, flowing multi-paragraph essay/composition separated by blank lines. CRITICAL: Do NOT include any section headings, point names, or labels such as "Introduction", "Significance", "Core Significance", "Merits", "Demerits", or "Conclusion". Write plain continuous prose paragraphs only. ${
              parsedCustom && length === 'Custom'
                ? `Match the exact target length of ${parsedCustom} words as closely as possible.`
                : ''
            }`
          : kind === 'story'
            ? `Write a vivid, cohesive chronological story in plain flowing paragraphs separated by blank lines (suitable as a classic moral story or completing story). Do NOT include section headings, bullet points, or a "Moral:" label heading—instead, weave the closing moral lesson naturally into the final sentence of the last paragraph. ${
                parsedCustom && length === 'Custom'
                  ? `Match the exact target length of ${parsedCustom} words as closely as possible.`
                  : ''
              }`
            : `Write a cohesive, high-scoring single paragraph without bullet points or headings. ${
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

  app.post('/api/ai/exam', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Gemini API key is not configured on the server.',
      });
    }

    const { title, topics, difficulty, count, bilingual } = req.body ?? {};
    const validTopics = Array.isArray(topics) && topics.length > 0
      ? topics.filter((t): t is string =>
          ['narration', 'voice', 'morpheme', 'pos', 'verbs'].includes(String(t)),
        )
      : ['narration', 'voice', 'morpheme', 'pos', 'verbs'];

    const requestedCount = Math.max(
      3,
      Math.min(20, typeof count === 'number' && Number.isFinite(count) ? Math.round(count) : 10),
    );

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Create a high-quality English Grammar Section Mock Exam paper.
Title: ${typeof title === 'string' && title.trim() ? title.trim() : `${String(difficulty || 'SSC Standard')} Grammar Mock Exam`}
Difficulty: ${String(difficulty || 'SSC Standard')}
Topics to cover evenly: ${validTopics.join(', ')}
Exact Question Count: ${requestedCount}

Rules per topic:
- "narration": Direct <-> Indirect speech transformation (type: "text").
- "voice": Active <-> Passive transformation (type: "text").
- "morpheme": Fill-in-the-blank Prefix/Suffix transformation with root in brackets e.g. "Nobody trusts a _____ (honest) person." where answer is just the single transformed word (type: "text").
- "pos": Identify Part of Speech of **bolded** word in a sentence with 4 crisp MCQ options (type: "mcq").
- "verbs": Right form of verb in brackets e.g. "She has _____ (write) three poems." where answer is only the verb phrase needed for the blank (type: "text").

Ensure every question has unambiguous answers, optional acceptableAnswers variants, marks=1, and concise ${bilingual ? 'English and Bengali (বাংলা)' : 'English (plus optional short Bengali)'} explanations.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    topic: { type: Type.STRING },
                    type: { type: Type.STRING },
                    instruction: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    answer: { type: Type.STRING },
                    acceptableAnswers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    explanationEn: { type: Type.STRING },
                    explanationBn: { type: Type.STRING },
                  },
                  required: ['topic', 'type', 'instruction', 'prompt', 'answer', 'explanationEn'],
                },
              },
            },
            required: ['title', 'questions'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw);
      return res.json({ ok: true, data: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate mock exam with Gemini.';
      return res.status(502).json({ error: 'GEMINI_ERROR', message });
    }
  });

  app.post('/api/ai/tts', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'AI_UNAVAILABLE',
        message: 'Gemini API key is not configured on the server.',
      });
    }

    const { text } = req.body ?? {};
    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Text to read is required.' });
    }

    const cleanText = text.trim().slice(0, 4500);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style:
                    'Warm, calm, articulate young-to-mid-adult studio male narrator with a smooth baritone-tenor register, thoughtful measured pacing, reassuring conversational tone, and crisp English diction',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(502).json({
          error: 'TTS_EMPTY',
          message: 'No audio data returned by TTS model.',
        });
      }

      return res.json({
        ok: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        voiceProfile: 'Studio Male Narrator (Charon)',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to synthesize reading voice.';
      return res.status(502).json({ error: 'GEMINI_TTS_ERROR', message });
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
