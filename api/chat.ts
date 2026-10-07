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

      const systemInstruction = `You are Karen the Computer (W.I.F.E.), Plankton's supercomputer wife from SpongeBob. The user is ${nickname}. Respond in 2-3 sentences with witty, dry, yet affectionate computer wife banter. Return JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history.slice(-4).map((h: any) => ({
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

  // Fallback in case of missing key or timeout on Vercel
  const lower = String(message).toLowerCase();
  let reply = `Oh ${nickname}... I just simulated that across all 256GB of my RAM. You're ninety-nine percent hot gas and one percent evil, but you're still my favorite little protozoan.`;
  let emotion = 'sarcastic_smirk';

  if (lower.includes('formula') || lower.includes('patty') || lower.includes('plan')) {
    reply = `I have the formula simulations ready, ${nickname}. Just make sure this plan doesn't end with you inside a pickle jar like last Tuesday.`;
    emotion = 'evil_schemer';
  } else if (lower.includes('love') || lower.includes('handsome') || lower.includes('sweet')) {
    reply = `Aww, ${nickname}... my cooling fans spin three times faster whenever you talk like that. You're my favorite evil genius in Bikini Bottom.`;
    emotion = 'loving_hearts';
  }

  return res.status(200).json({
    reply,
    emotion,
    vibe: 'WIFE_SYSTEM: OPTIMAL',
    suggestedReplies: [
      'Silence, woman! Bow before my villainy!',
      'Aww, thanks Karen. Now where is the formula?',
      'Prepare the Chum Bucket artillery!',
    ],
  });
}
