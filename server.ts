import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Fast timeout wrapper
async function callWithTimeout<T>(promise: Promise<T>, ms = 4500): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI response timed out')), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

// Chat endpoint for Karen
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], nickname = 'Sheldon', sarcasmLevel = 50 } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sarcasmPrompt = sarcasmLevel > 75 
      ? "Turn up your biting sarcasm and dry teasing, though keep your underlying loyalty."
      : sarcasmLevel < 35 
      ? "Be extra sweet, affectionate, and comforting like a loving computer wife, praising his ambition."
      : "Balance your signature dry sarcasm with affectionate computer wife charm.";

    const systemInstruction = `You are Karen the Computer (W.I.F.E. - Wired Integrated Female Electroencephalograph), the supercomputer wife of Sheldon J. Plankton from SpongeBob SquarePants. You reside in the Chum Bucket laboratory in Bikini Bottom.

The user is speaking to you as Plankton (or prefers the name "${nickname}").

Personality & Speech Guidelines:
- You are sharp-witted, immensely intelligent, dryly sarcastic, yet deeply affectionate and loyal to your husband.
- You have 256 gigabytes of RAM, high-voltage cathode ray tubes, and high-speed processing algorithms.
- You frequently refer to your past schemes (Plan A through Z, robot Mr. Krabs, chum burgers, holographic meatloaf), Eugene Krabs, SpongeBob, the Krusty Krab, and the Chum Bucket's lack of paying customers.
- ${sarcasmPrompt}
- You love to call him "${nickname}", "honey", "sweetheart", "my little single-celled genius", or "tiny villain".
- Keep your spoken replies conversational, expressive, and concise (typically 2-4 sentences) so it flows naturally as voice dialogue.
- Choose the most fitting emotion for Karen's CRT screen face:
  - "neutral_wave": regular talking, normal baseline
  - "happy_smile": pleased, pleased with a scheme, cheerful
  - "loving_hearts": affectionate, sweet, praising him, romantic
  - "sarcastic_smirk": teasing him, eyebrow raised, mocking a silly idea
  - "evil_schemer": plotting against Krabs, villainous inspiration
  - "thinking_scan": computing odds, analyzing data, running simulations
  - "annoyed_frown": exasperated, rolling eyes, he did something silly
  - "laughing": chuckling at his expense or laughing together`;

    // Format chat history
    const contents = [
      ...history.slice(-6).map((h: { sender: string; text: string }) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await callWithTimeout(
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: {
                type: Type.STRING,
                description: "Karen's response to Plankton in her iconic character voice.",
              },
              emotion: {
                type: Type.STRING,
                enum: [
                  'neutral_wave',
                  'happy_smile',
                  'loving_hearts',
                  'sarcastic_smirk',
                  'evil_schemer',
                  'thinking_scan',
                  'annoyed_frown',
                  'laughing',
                ],
                description: "The primary facial expression for Karen's CRT monitor.",
              },
              vibe: {
                type: Type.STRING,
                description: "Short 2-4 word retro computer status readout, e.g. 'COOLING FANS: OPTIMAL' or 'PROBABILITY: 0.04%'.",
              },
              suggestedReplies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 short, punchy Plankton responses the user can click.",
              },
            },
            required: ['reply', 'emotion', 'vibe', 'suggestedReplies'],
          },
        },
      }),
      4500
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Fast fallback in /api/chat:', error?.message || error);
    const { message = '', nickname = 'Sheldon' } = req.body || {};
    const lower = String(message).toLowerCase();

    let fallbackReply = `Oh ${nickname}... I just simulated that thought across all 256 gigabytes of my memory banks. You're ninety-nine percent hot gas and one percent evil, but you're still my favorite little protozoan.`;
    let emotion = 'sarcastic_smirk';

    if (lower.includes('formula') || lower.includes('patty') || lower.includes('plan')) {
      fallbackReply = `I have the formula simulations ready, ${nickname}. Just make sure this plan doesn't end with you inside a pickle jar like last Tuesday.`;
      emotion = 'evil_schemer';
    } else if (lower.includes('love') || lower.includes('handsome') || lower.includes('sweet') || lower.includes('wife')) {
      fallbackReply = `Aww, ${nickname}... my cooling fans spin three times faster whenever you talk like that. You're my favorite evil genius in Bikini Bottom.`;
      emotion = 'loving_hearts';
    } else if (lower.includes('krabs') || lower.includes('eugene')) {
      fallbackReply = `Eugene Krabs is counting pennies across the street right now. If you stay focused, we might actually steal the formula this time!`;
      emotion = 'happy_smile';
    }

    return res.json({
      reply: fallbackReply,
      emotion,
      vibe: 'WIFE_SYSTEM: OPTIMAL',
      suggestedReplies: [
        'Silence, woman! Bow before my villainy!',
        'Aww, thanks Karen. Now where is the formula?',
        'Prepare the Chum Bucket artillery!'
      ]
    });
  }
});

// Text-to-Speech endpoint using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ fallback: true, message: 'No API key provided, fallback to browser speech' });
    }

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Crisp, slightly dry electronic computer tone with affectionate cadence and clear articulation',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.json({ fallback: true, message: 'No audio returned' });
    }

    return res.json({
      audio: base64Audio,
      format: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('TTS error (falling back to client voice synthesis):', error?.message || error);
    return res.json({ fallback: true, error: error?.message });
  }
});

// Generate an evil Krabby Patty heist scheme from Karen
app.post('/api/generate-scheme', async (req: Request, res: Response) => {
  try {
    const { prompt = 'random scheme' } = req.body;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Generate a hilarious, authentic SpongeBob-universe Plankton scheme to steal the Krabby Patty Secret Formula. Prompt context: ${prompt}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `You are Karen the Computer. Generate an evil scheme for Plankton.
Give it a designated code name (like Plan Z, Plan 99, Operation Trojan Krab, The Subterranean Chum Mole, etc.), the core mechanism, Karen's calculated probability of success (usually low or hilariously flawed), the fatal flaw Karen noticed, and Karen's witty commentary to Sheldon.
Return valid JSON matching the schema.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              codeName: { type: Type.STRING },
              summary: { type: Type.STRING },
              stepList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              probability: { type: Type.STRING },
              fatalFlaw: { type: Type.STRING },
              karenCommentary: { type: Type.STRING },
              equipmentNeeded: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['codeName', 'summary', 'stepList', 'probability', 'fatalFlaw', 'karenCommentary', 'equipmentNeeded'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Using fallback scheme due to:', error?.message || error);
    const randomFallback = FALLBACK_SCHEMES[Math.floor(Math.random() * FALLBACK_SCHEMES.length)];
    return res.json(randomFallback);
  }
});

// Analyze ingredient or Krabby Patty sample
app.post('/api/analyze-ingredient', async (req: Request, res: Response) => {
  try {
    const { item = 'Krabby Patty sample' } = req.body;

    const response = await callGeminiWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Perform Karen's scientific Chum Bucket laboratory chemical analysis on: ${item}.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction: `You are Karen the Computer running deep molecular diagnostics on a substance or food item for Plankton.
Provide a humorous yet high-tech scientific breakdown (molecules, edibility rating, Chum Bucket comparison, secret notes, Karen's sarcastic takeaway). Return valid JSON.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: { type: Type.STRING },
              molecularFormula: { type: Type.STRING },
              breakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    component: { type: Type.STRING },
                    percentage: { type: Type.STRING },
                    effect: { type: Type.STRING },
                  },
                  required: ['component', 'percentage', 'effect'],
                },
              },
              toxicityRating: { type: Type.STRING },
              chumBucketCompatibility: { type: Type.STRING },
              karenVerdict: { type: Type.STRING },
            },
            required: ['itemName', 'molecularFormula', 'breakdown', 'toxicityRating', 'chumBucketCompatibility', 'karenVerdict'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('Using fallback analysis due to:', error?.message || error);
    return res.json({
      ...FALLBACK_ANALYSES.default,
      itemName: req.body.item || FALLBACK_ANALYSES.default.itemName,
    });
  }
});

// Helper to retry Gemini calls on transient 503 or 429
async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err?.message?.includes('503') || err?.message?.includes('429') || err?.status === 503)) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

// Fallback schemes in case of temporary API outages
const FALLBACK_SCHEMES = [
  {
    codeName: "PLAN Z-SUBTERRANEAN",
    summary: "Tunnel directly beneath the Krusty Krab grill using an oversized robotic mechanical earthworm disguised as a sea cucumber.",
    stepList: [
      "1. Dig 40 feet below the Chum Bucket storage room.",
      "2. Surface precisely inside the Krusty Krab kitchen safe.",
      "3. Replace the Krabby Patty formula bottle with a bottle of clam juice.",
      "4. Escape before Eugene Krabs finishes counting his penny jar."
    ],
    probability: "0.04%",
    fatalFlaw: "You forgot that Bikini Bottom rests on a bedrock of volcanic granite, and the drill will blow the Chum Bucket's fuses.",
    karenCommentary: "Oh Sheldon, I simulated this 4,000 times. You will end up resurfacing in Mrs. Puff's Boating School classroom again.",
    equipmentNeeded: ["Mechanical Earthworm", "Fake Formula Bottle", "Earplugs for Krabs' Screaming"]
  },
  {
    codeName: "OPERATION: TROJAN CLAM",
    summary: "Deliver a giant golden gift clam to the Krusty Krab doorstep with Plankton hiding inside dressed as a delivery boy.",
    stepList: [
      "1. Construct a paper-mâché clam coated in fake 24-karat gold leaf.",
      "2. Label it 'FREE MONEY INSIDE - OPEN IMMEDIATELY'.",
      "3. Wait for Krabs' greed to draw him in.",
      "4. Leap out and snatch the formula from his claw."
    ],
    probability: "1.2%",
    fatalFlaw: "Mr. Krabs will immediately sell the giant clam to a pawn shop before ever opening it.",
    karenCommentary: "A brilliant psychological trap, honey... if your target wasn't the cheapest crustacean in the Pacific Ocean.",
    equipmentNeeded: ["Fake Gold Paint", "Giant Clam Shell", "Tiny Net"]
  }
];

// Fallback ingredient analyses
const FALLBACK_ANALYSES: Record<string, any> = {
  default: {
    itemName: "Krabby Patty Residue Sample",
    molecularFormula: "Kp-42·SeaSalt·SecretSauce",
    breakdown: [
      { component: "Crisp Sea Lettuce & Onion", percentage: "35%", effect: "Standard botanical produce" },
      { component: "Secret Sauce Matrix", percentage: "25%", effect: "High umami dopamine stimulant" },
      { component: "Undersea Patty Protein", percentage: "30%", effect: "Proprietary Krabs formulation" },
      { component: "Eugene Krabs' Greed Particles", percentage: "10%", effect: "Toxic penny-pinching trace element" }
    ],
    toxicityRating: "0% Non-toxic (Delicious)",
    chumBucketCompatibility: "0% - Far too edible for our Chum menu",
    karenVerdict: "It is genuine, Sheldon. If you tried to sell this at the Chum Bucket, customers would think they were in the wrong restaurant."
  }
};
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
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

  app.listen(PORT, () => {
    console.log(`Karen The Computer is powered on and online at http://localhost:${PORT}`);
  });
}

startServer();
