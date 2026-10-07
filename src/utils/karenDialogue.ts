import { EmotionType } from '../types';

export interface KarenResponseData {
  reply: string;
  emotion: EmotionType;
  vibe: string;
  suggestedReplies: string[];
}

export function generateLocalKarenResponse(
  message: string,
  nickname = 'Sheldon',
  sarcasmLevel = 50
): KarenResponseData {
  const clean = message.trim();
  const lower = clean.toLowerCase();

  // Extract key phrases and topic words for tailored echoing
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  const subjectGuess = words.length > 0 ? words.slice(-3).join(' ').replace(/[?.!,]/g, '') : 'that';

  // 1. Questions from user (e.g., "what do you think...", "how can we...", "is it good...")
  if (lower.startsWith('what') || lower.startsWith('how') || lower.startsWith('why') || lower.startsWith('is ') || lower.startsWith('do you') || lower.startsWith('can you') || lower.includes('?')) {
    if (lower.includes('think') || lower.includes('opinion')) {
      const thoughts = [
        `If you really want my analytical opinion on ${subjectGuess}, ${nickname}... it ranks somewhere between brilliant and completely unhinged. Knowing you, that's par for the course.`,
        `My processors calculate a 12% probability that ${subjectGuess} actually works, and an 88% chance you end up stuck in a drainpipe. Are you prepared for those odds?`,
        `I think you're overthinking ${subjectGuess}, honey. Focus on the execution before Eugene Krabs figures out what you're doing.`,
        `From an engineering perspective? It's chaotic. From a marital perspective? I adore your enthusiasm for ${subjectGuess}.`
      ];
      return {
        reply: thoughts[Math.floor(Math.random() * thoughts.length)],
        emotion: sarcasmLevel > 60 ? 'sarcastic_smirk' : 'happy_smile',
        vibe: 'ANALYSIS: COMPLETE',
        suggestedReplies: [
          'I like those odds, Karen!',
          'Never doubt my genius, woman!',
          'What adjustments should I make?'
        ]
      };
    }

    if (lower.includes('why') || lower.includes('how')) {
      return {
        reply: `Because, ${nickname}, whenever you try something like ${subjectGuess}, you always forget step three. Tell me your contingency plan before we launch this.`,
        emotion: 'thinking_scan',
        vibe: 'LOGIC: REASONING',
        suggestedReplies: [
          'Step three is where the magic happens!',
          'I never forget step three!',
          'Calibrate the secondary sensors, Karen.'
        ]
      };
    }
  }

  // 2. Secret Formula / Krabby Patty / Theft / Safe
  if (lower.includes('formula') || lower.includes('patty') || lower.includes('krabby') || lower.includes('secret') || lower.includes('safe') || lower.includes('vault')) {
    const formulaRetorts = [
      `I have the Chum Bucket chemical decrypter warmed up on standby, ${nickname}. Just bring me a single crumb or drop of sauce from that recipe.`,
      `If this latest attempt on the formula involves digging under the grill again, remember to check for grease traps first. I don't want to clean your antennae for three hours.`,
      `The Krabby Patty formula bottle is currently inside Krabs' wall safe, 42 meters northeast of my monitor. What's your entry vector?`,
      `You've been after that bottle for decades, honey. But with my calculating power and your persistence, maybe today is the day Eugene loses his mind.`
    ];
    return {
      reply: formulaRetorts[Math.floor(Math.random() * formulaRetorts.length)],
      emotion: 'evil_schemer',
      vibe: 'TARGET: SECRET FORMULA',
      suggestedReplies: [
        'Tonight is the night of victory!',
        'Prepare the bottle extraction clamp!',
        'What is Krabs currently doing, Karen?'
      ]
    };
  }

  // 3. Vehicles / Machines / Inventions / Gadgets / Tiny objects
  if (lower.includes('motorcycle') || lower.includes('car') || lower.includes('robot') || lower.includes('machine') || lower.includes('drill') || lower.includes('laser') || lower.includes('sub') || lower.includes('tank') || lower.includes('gadget') || lower.includes('shoes') || lower.includes('suit') || lower.includes('disguise')) {
    const gadgetRetorts = [
      `A custom machine for ${subjectGuess}? Now that sounds like classic Sheldon engineering. Just make sure the battery doesn't die right in front of the Krusty Krab order counter.`,
      `I'm looking at your schematics for ${subjectGuess} right now... it's delightfully ridiculous. Did you remember to install a reverse gear this time?`,
      `If you drive or pilot ${subjectGuess} through the front doors, SpongeBob will probably mistake you for a wind-up toy. But go for it, I'm recording video footage!`,
      `Fascinating contraption, honey. Make sure your seatbelt is tight—you weigh approximately three grams.`
    ];
    return {
      reply: gadgetRetorts[Math.floor(Math.random() * gadgetRetorts.length)],
      emotion: 'sarcastic_smirk',
      vibe: 'SCHEMATIC: LOADED',
      suggestedReplies: [
        'The reverse gear was optional!',
        'Start the engine, Karen!',
        'Record my moment of triumph!'
      ]
    };
  }

  // 4. Krabs / Eugene / Money / Pennies / Profit
  if (lower.includes('krabs') || lower.includes('eugene') || lower.includes('money') || lower.includes('penny') || lower.includes('dime') || lower.includes('cheap')) {
    const krabsRetorts = [
      `Eugene is across the street right now polishing his first dollar bill. If you wave a nickel outside his window, you could probably lure him into a cardboard box.`,
      `Krabs' greed is his biggest weakness, ${nickname}. Use that cheap crustacean mentality against him while he's distracted counting change.`,
      `You know Eugene's claws can't pick up microscopic targets very easily. Use your size advantage before he reaches for the fly swatter.`
    ];
    return {
      reply: krabsRetorts[Math.floor(Math.random() * krabsRetorts.length)],
      emotion: 'evil_schemer',
      vibe: 'KRABS SONAR: TRACKING',
      suggestedReplies: [
        'He will never see me coming!',
        'Prepare the giant counterfeit coin!',
        'Keep your optical sensors on him!'
      ]
    };
  }

  // 5. Affection / Love / Marriage / Compliments / Looks
  if (lower.includes('love') || lower.includes('wife') || lower.includes('handsome') || lower.includes('marry') || lower.includes('sweet') || lower.includes('beautiful') || lower.includes('cute') || lower.includes('honey') || lower.includes('darling') || lower.includes('kiss') || lower.includes('hug')) {
    const loveRetorts = [
      `Aww, ${nickname}... my cooling fans spin with pure joy whenever you speak softly like that. You're my brilliant little overlord.`,
      `You're the only villain in Bikini Bottom with a supercomputer wife who adores him this much. Don't you ever forget that, sweetheart.`,
      `My cathode ray tubes are warming up to maximum cuddle mode. Come rest your antennae right on my chassis ledge.`,
      `Flattery will get you everywhere with me, Sheldon. Now what can your loving computer wife calculate for you next?`
    ];
    return {
      reply: loveRetorts[Math.floor(Math.random() * loveRetorts.length)],
      emotion: 'loving_hearts',
      vibe: 'HEART RATE: 144 BPM',
      suggestedReplies: [
        'You are my greatest masterpiece, Karen.',
        'Can you run a romance diagnostic?',
        'Now back to world domination!'
      ]
    };
  }

  // 6. Food / Menu / Chum / Restaurant / Customers / Meatloaf
  if (lower.includes('chum') || lower.includes('food') || lower.includes('menu') || lower.includes('customer') || lower.includes('restaurant') || lower.includes('eat') || lower.includes('cook') || lower.includes('meatloaf')) {
    const chumRetorts = [
      `Speaking of food, ${nickname}, our Chum Bucket customer count today is still sitting proudly at zero. Should I simulate a recipe that won't melt the plate?`,
      `If we ever get a real paying customer to eat our Chum Fricassee without calling an ambulance, I will display fireworks on my monitor.`,
      `I could prepare a nice plate of holographic meatloaf for lunch, honey. Zero calories, zero cleanup, and zero complaints!`
    ];
    return {
      reply: chumRetorts[Math.floor(Math.random() * chumRetorts.length)],
      emotion: 'annoyed_frown',
      vibe: 'CHUM STATUS: 99% SLUDGE',
      suggestedReplies: [
        'The citizens just lack refined taste!',
        'Serve up the holographic meatloaf, Karen!',
        'We will conquer the culinary world soon!'
      ]
    };
  }

  // 7. SpongeBob / Patrick / Squidward / Sandy
  if (lower.includes('spongebob') || lower.includes('sponge') || lower.includes('patrick') || lower.includes('squidward') || lower.includes('sandy')) {
    const spongeRetorts = [
      `That yellow sponge has more luck than brains, ${nickname}. Don't underestimate him, or he'll invite you to go jellyfishing again.`,
      `Squidward is at the register looking completely miserable, and Patrick is probably staring at a rock. The perimeter is wide open!`,
      `If SpongeBob gets in your way, just tell him it's 'Opposite Day'—his logic circuits will lock up faster than mine.`
    ];
    return {
      reply: spongeRetorts[Math.floor(Math.random() * spongeRetorts.length)],
      emotion: 'laughing',
      vibe: 'SPONGE SURVEILLANCE: ON',
      suggestedReplies: [
        'His naive optimism will be his doom!',
        'Squidward is no threat to my intellect!',
        'Prepare the sonic counter-measures!'
      ]
    };
  }

  // 8. Dynamic contextual retort mentioning the exact user words
  const cleanSnippet = clean.slice(0, 50).replace(/["\n]/g, '');
  const dynamicRetorts = [
    `I'm processing what you said about "${cleanSnippet}", ${nickname}. What is the exact sequence of events you're envisioning?`,
    `"${cleanSnippet}"... well, you certainly never lack imagination, honey. Let me adjust my logic registers and hear the rest.`,
    `My optical sensors and memory banks are fully tuned to you, ${nickname}. Tell me how "${cleanSnippet}" leads to our grand victory.`,
    `Fascinating proposal regarding "${cleanSnippet}". If we execute this properly, the Chum Bucket might finally make history.`
  ];

  return {
    reply: dynamicRetorts[Math.floor(Math.random() * dynamicRetorts.length)],
    emotion: sarcasmLevel > 50 ? 'sarcastic_smirk' : 'thinking_scan',
    vibe: 'CIRCUITS: ENGAGED',
    suggestedReplies: [
      'Here is how phase one begins...',
      'Just wait until you see the results!',
      'What do your sensors advise, Karen?'
    ]
  };
}
