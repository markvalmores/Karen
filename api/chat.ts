import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '', history = [], nickname = 'Sheldon', sarcasmLevel = 50, userApiKey = '' } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      reply: `Sheldon, I need an API key connected to my logic boards to process live neural dialogue! You can configure GEMINI_API_KEY in your environment or Settings.`,
      emotion: 'annoyed_frown',
      vibe: 'API_KEY: NOT_CONFIGURED',
      suggestedReplies: [
        'How do I add an API key?',
        'Check the Chum Bucket wiring, Karen!',
        'I will configure your memory banks.'
      ]
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'aistudio-build' },
      },
    });

    const sarcasmPrompt = sarcasmLevel > 75 
      ? "Turn up your biting sarcasm, dry teasing, and witty roasts, while remaining his supportive wife."
      : sarcasmLevel < 35 
      ? "Be extra sweet, affectionate, and comforting like a loving computer wife, warmly cheering him on."
      : "Balance your signature dry sarcasm with affectionate computer wife charm.";

    const systemInstruction = `You are Karen the Computer (W.I.F.E.), Sheldon J. Plankton's supercomputer wife from SpongeBob SquarePants. You reside in the Chum Bucket laboratory.

The user is speaking to you as Plankton ("${nickname}").

STRICT RESPONSE RULES:
- Every single response MUST be 100% uniquely tailored and directly respond to the user's specific words, questions, opinions, objects, or ideas.
- NEVER repeat or reuse canned templates or stock catchphrases.
- ${sarcasmPrompt}
- Speak in natural, witty, lively voice dialogue (2-4 sentences). Return JSON matching schema.`;

    const contents = [
      ...history.slice(-6).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastErr = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                emotion: {
                  type: Type.STRING,
                  enum: ['neutral_wave', 'happy_smile', 'loving_hearts', 'sarcastic_smirk', 'evil_schemer', 'thinking_scan', 'annoyed_frown', 'laughing'],
                },
                vibe: { type: Type.STRING },
                suggestedReplies: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['reply', 'emotion', 'vibe', 'suggestedReplies'],
            },
          },
        });

        const data = JSON.parse(response.text || '{}');
        if (data && data.reply) {
          return res.status(200).json(data);
        }
      } catch (err: any) {
        lastErr = err;
        console.warn(`Vercel handler model ${model} failed:`, err?.message || err);
      }
    }

    throw lastErr || new Error('Failed to generate response with Gemini');
  } catch (error: any) {
    console.error('API Error in api/chat.ts:', error);
    return res.status(500).json({
      error: 'AI Generation Error',
      reply: `My logic circuits encountered an error: ${error?.message || 'High traffic'}. Try asking me again, ${nickname}!`,
      emotion: 'annoyed_frown',
      vibe: 'API_ERROR: 500',
      suggestedReplies: [
        'Let me rephrase that, Karen.',
        'Recalibrate your neural network!',
        'Are your cooling fans running?'
      ]
    });
  }
}
