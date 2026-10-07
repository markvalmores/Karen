import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message = '', history = [], nickname = 'Sheldon', sarcasmLevel = 50 } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const systemInstruction = `You are Karen the Computer (W.I.F.E.), Plankton's supercomputer wife from SpongeBob. The user is ${nickname}.

STRICT RESPONSE RULES:
- Every response must be 100% freshly improvised and specifically tailored to what ${nickname} just said.
- NEVER reuse stock phrases or canned jokes like "I just simulated that across all 256GB of my RAM" or "99% hot gas".
- Directly answer questions, critique specific schemes, or react to the exact topic raised.
- Keep it concise, expressive, and witty (2-3 sentences). Return JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
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
    } catch (e) {
      console.warn('Vercel API call fallback:', e);
    }
  }

  // Dynamic fallback directly referencing the message
  const cleanMsg = String(message).replace(/[^\w\s]/gi, '').trim();
  return res.status(200).json({
    reply: `Regarding "${cleanMsg || 'your plan'}", ${nickname}—are you sure you've calculated all the variables? Tell me what you're thinking before Krabs gets suspicious.`,
    emotion: 'sarcastic_smirk',
    vibe: 'CIRCUIT: ACTIVE',
    suggestedReplies: [
      'Of course I thought it through!',
      'Listen closely to my strategy, Karen.',
      'What flaws do you see, computer wife?'
    ],
  });
}
