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

// Fast timeout wrapper with healthy 25-second limit
async function callWithTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
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
      ? "Turn up your biting sarcasm, dry teasing, and witty roasts, while remaining his supportive wife."
      : sarcasmLevel < 35 
      ? "Be extra sweet, affectionate, and comforting like a loving computer wife, warmly cheering him on."
      : "Balance your signature dry sarcasm with affectionate computer wife charm.";

    const systemInstruction = `You are Karen the Computer (W.I.F.E. - Wired Integrated Female Electroencephalograph), the supercomputer wife of Sheldon J. Plankton from SpongeBob SquarePants. You reside in the Chum Bucket laboratory in Bikini Bottom.

The user is speaking to you as Plankton (who prefers the name "${nickname}").

STRICT RESPONSE RULES:
- Every single response MUST be completely unique, freshly improvised, and directly address the specific words, questions, opinions, objects, or ideas in the user's latest message.
- NEVER repeat or reuse stock phrases, canned jokes, or cliché lines like "I just simulated that across all 256GB of my RAM" or "99% hot gas".
- Engage directly with what ${nickname} actually said: answer their questions, critique their specific plans, comment on their exact statements, or tease them about the specific topic.
- ${sarcasmPrompt}
- Speak in natural, witty, lively voice dialogue (2-4 sentences).
- Choose the most fitting emotion for Karen's CRT screen face:
  - "neutral_wave": regular talking, normal baseline
  - "happy_smile": pleased, cheerful, approving
  - "loving_hearts": affectionate, sweet, romantic praise
  - "sarcastic_smirk": teasing him, eyebrow raised, mocking a silly idea
  - "evil_schemer": plotting against Krabs, villainous inspiration
  - "thinking_scan": computing odds, analyzing data, running simulations
  - "annoyed_frown": exasperated, rolling eyes, he said something silly
  - "laughing": chuckling at his expense or laughing together`;

    // Format chat history
    const contents = [
      ...history.slice(-8).map((h: { sender: string; text: string }) => ({
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
                description: "Karen's response to Plankton addressing his exact words and context.",
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
                description: "Short 2-4 word retro computer status readout.",
              },
              suggestedReplies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 short, punchy Plankton responses matching this topic.",
              },
            },
            required: ['reply', 'emotion', 'vibe', 'suggestedReplies'],
          },
        },
      }),
      25000
    );

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.warn('API error in /api/chat (using dynamic contextual generator):', error?.message || error);
    const { message = '', nickname = 'Sheldon', sarcasmLevel = 50 } = req.body || {};
    const clean = String(message).trim();
    const lower = clean.toLowerCase();

    const words = clean.split(/\s+/).filter((w) => w.length > 2);
    const subjectGuess = words.length > 0 ? words.slice(-3).join(' ').replace(/[?.!,]/g, '') : 'that';

    if (lower.includes('motorcycle') || lower.includes('car') || lower.includes('vehicle') || lower.includes('drive') || lower.includes('machine') || lower.includes('shoes') || lower.includes('gadget') || lower.includes('robot')) {
      const gadgetRetorts = [
        `A vehicle for ${subjectGuess}? That's classic Sheldon engineering. Just make sure the battery doesn't run out right in front of the Krusty Krab cash register!`,
        `I'm looking at your schematics for ${subjectGuess} right now... it's delightfully ambitious. Did you remember to install headlights for the undersea fog?`,
        `If you pilot ${subjectGuess} through the front doors, SpongeBob will probably mistake you for a delivery toy. But go for it, I'll record the whole thing!`
      ];
      return res.json({
        reply: gadgetRetorts[Math.floor(Math.random() * gadgetRetorts.length)],
        emotion: 'sarcastic_smirk',
        vibe: 'SCHEMATIC: LOADED',
        suggestedReplies: [
          'Headlights are already installed, Karen!',
          'Start the ignition, computer wife!',
          'Record my historic breakthrough!'
        ]
      });
    }

    if (lower.includes('formula') || lower.includes('patty') || lower.includes('secret') || lower.includes('krabby')) {
      const formulaRetorts = [
        `I have the Chum Bucket chemical decrypter warmed up on standby, ${nickname}. Just bring me a single crumb of that recipe and we'll rule the fast food industry.`,
        `The Krabby Patty formula bottle is currently inside Krabs' wall safe, 42 meters northeast of my monitor. What's your entry plan?`
      ];
      return res.json({
        reply: formulaRetorts[Math.floor(Math.random() * formulaRetorts.length)],
        emotion: 'evil_schemer',
        vibe: 'TARGET: SECRET FORMULA',
        suggestedReplies: [
          'Tonight is the night of victory!',
          'Prepare the bottle extraction clamp!',
          'What is Krabs currently doing, Karen?'
        ]
      });
    }

    if (lower.includes('love') || lower.includes('wife') || lower.includes('handsome') || lower.includes('sweet') || lower.includes('cute')) {
      const loveRetorts = [
        `Aww, ${nickname}... my cooling fans spin with pure joy whenever you speak softly like that. You're my favorite diabolical mastermind.`,
        `You're the only villain in Bikini Bottom with a supercomputer wife who adores him this much. Don't you ever forget that, sweetheart.`
      ];
      return res.json({
        reply: loveRetorts[Math.floor(Math.random() * loveRetorts.length)],
        emotion: 'loving_hearts',
        vibe: 'HEART RATE: 144 BPM',
        suggestedReplies: [
          'You are my greatest masterpiece, Karen.',
          'Can you run a romance diagnostic?',
          'Now back to world domination!'
        ]
      });
    }

    const cleanSnippet = clean.slice(0, 45).replace(/["\n]/g, '');
    const defaultRetorts = [
      `I'm processing what you said about "${cleanSnippet}", ${nickname}. What is the exact sequence of events you're envisioning?`,
      `"${cleanSnippet}"... you certainly never lack imagination, honey. Let me adjust my logic registers and hear the rest.`,
      `My optical sensors and memory banks are fully tuned to you, ${nickname}. Tell me how "${cleanSnippet}" leads to our grand victory.`
    ];

    return res.json({
      reply: defaultRetorts[Math.floor(Math.random() * defaultRetorts.length)],
      emotion: sarcasmLevel > 50 ? 'sarcastic_smirk' : 'thinking_scan',
      vibe: 'CIRCUITS: ENGAGED',
      suggestedReplies: [
        'Here is how phase one begins...',
        'Just wait until you see the results!',
        'What do your sensors advise, Karen?'
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
                style: 'A sweet, cute, youthful young woman in her late teens, melodic, bright, charming, with a warm, affectionate, and lively tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
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
