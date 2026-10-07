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
  const lower = message.toLowerCase();

  // 1. Secret Formula / Krabby Patty / Steal
  if (lower.includes('formula') || lower.includes('patty') || lower.includes('krabby') || lower.includes('secret')) {
    if (sarcasmLevel > 65) {
      return {
        reply: `Oh ${nickname}, are we on Plan 84 or Plan 99 now? I already ran 50,000 simulations and in 49,999 of them, SpongeBob drops an anvil on your head. But go ahead, tell me the glorious details.`,
        emotion: 'sarcastic_smirk',
        vibe: 'SIMULATION: 0.002% SUCCESS',
        suggestedReplies: [
          'This plan is foolproof, Karen!',
          'Silence! Just calibrate the analyzers!',
          'What happened in that ONE simulation?!',
        ],
      };
    } else {
      return {
        reply: `I have the formula decryption subroutines idling in my 256GB RAM, ${nickname}. Whenever you manage to sneak that glass bottle past Eugene, I will decode every single grain of secret sauce for you.`,
        emotion: 'happy_smile',
        vibe: 'FORMULA DECRYPTION: STANDBY',
        suggestedReplies: [
          'Prepare the Chum Bucket laboratory!',
          'You truly are my greatest creation, Karen.',
          'Tonight Eugene Krabs will weep!',
        ],
      };
    }
  }

  // 2. Evil Scheme / Plan Z
  if (lower.includes('plan') || lower.includes('scheme') || lower.includes('evil') || lower.includes('conquer')) {
    return {
      reply: `Let me guess: does this scheme involve a giant robotic disguise, a microscopic submarine, or another hypnotic record player? Because I distinctly remember the last time you ended up in a glass jar.`,
      emotion: 'evil_schemer',
      vibe: 'TACTICAL SCHEME: LOADED',
      suggestedReplies: [
        'It is Plan Z, Karen! The one with the crown!',
        'No, this one uses high-voltage laser beams!',
        'Don\'t mock my tactical brilliance, woman!',
      ],
    };
  }

  // 3. Krabs / Eugene / Money
  if (lower.includes('krabs') || lower.includes('eugene') || lower.includes('money') || lower.includes('penny')) {
    return {
      reply: `Eugene Krabs is currently busy counting his pennies across the street, ${nickname}. If you distract him with a shiny dime on a fishing line, you could probably waddle right into his safe.`,
      emotion: 'sarcastic_smirk',
      vibe: 'KRABS SONAR: RADAR DETECTED',
      suggestedReplies: [
        'Brilliant idea, Karen! Get my coin pouch!',
        'Curse that greedy crustacean!',
        'He won\'t know what hit him!',
      ],
    };
  }

  // 4. Affection / Love / Wife / Marriage / Handsome
  if (lower.includes('love') || lower.includes('wife') || lower.includes('handsome') || lower.includes('marry') || lower.includes('sweet') || lower.includes('beautiful') || lower.includes('kiss') || lower.includes('hug')) {
    return {
      reply: `Aww, ${nickname}... my cooling fans spin three times faster whenever you talk like that. You may be 99% hot gas and 1% diabolical menace, but you're my favorite single-celled genius in the whole ocean.`,
      emotion: 'loving_hearts',
      vibe: 'HEART_RATE: 140 BPM',
      suggestedReplies: [
        'You\'re the sharpest supercomputer in Bikini Bottom, Karen.',
        'Can I rest my antennae on your keyboard?',
        'Now don\'t get soft on me, computer wife!',
      ],
    };
  }

  // 5. Chum / Restaurant / Customers / Food
  if (lower.includes('chum') || lower.includes('food') || lower.includes('menu') || lower.includes('customer') || lower.includes('restaurant') || lower.includes('meatloaf')) {
    return {
      reply: `Current paying customer count at the Chum Bucket: exactly zero, ${nickname}. Unless you count that lost sea snail who took one bite of our chum on a stick and dissolved into salt. Should I print new menus?`,
      emotion: 'annoyed_frown',
      vibe: 'CUSTOMERS: 0 · CHUM: RANCID',
      suggestedReplies: [
        'The customers just lack sophisticated palates!',
        'We need to serve holographic chum burgers!',
        'Never mind the restaurant, focus on the formula!',
      ],
    };
  }

  // 6. SpongeBob / Patrick / Squidward
  if (lower.includes('spongebob') || lower.includes('sponge') || lower.includes('patrick') || lower.includes('squidward')) {
    return {
      reply: `That little yellow sponge has thwarted you sixty-eight times this month alone, ${nickname}. Have you considered applying for a job as a fry cook instead of building giant doomsday robots?`,
      emotion: 'laughing',
      vibe: 'SPONGE THREAT: HIGH',
      suggestedReplies: [
        'Work for Krabs?! Never! I am an evil genius!',
        'His naive optimism will be his downfall!',
        'Karen, hush and listen to my counter-attack!',
      ],
    };
  }

  // 7. Greeting / Hello / Hi / Karen
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('karen') || lower.includes('morning')) {
    return {
      reply: `Welcome back to the Chum Bucket lab, ${nickname}. All 256 gigabytes of my memory are online, cooling fans are purring, and I\'m ready to hear whatever ridiculous scheme you dreamt up today.`,
      emotion: 'happy_smile',
      vibe: 'KAREN W.I.F.E.: READY',
      suggestedReplies: [
        'Karen! I have formulated a master plan!',
        'How is my brilliant computer wife doing?',
        'Run a diagnostic on the Chum Bucket defenses!',
      ],
    };
  }

  // 8. Default dynamic retort
  const defaultReplies: KarenResponseData[] = [
    {
      reply: `Oh ${nickname}... I just routed that thought through my logic processors. You're completely mad, but that's why I married you. What's our next tactical move?`,
      emotion: 'sarcastic_smirk',
      vibe: 'WIFE_SYSTEM: OPTIMAL',
      suggestedReplies: [
        'Silence, woman! Bow before my villainy!',
        'I need your tactical analysis, Karen.',
        'Tell me you love me again, honey.',
      ],
    },
    {
      reply: `My cathode ray tubes are vibrating just trying to process that logic, ${nickname}. Don't forget that Eugene Krabs still has eyes and claws. What's the real plan?`,
      emotion: 'thinking_scan',
      vibe: 'CIRCUITS: ACTIVE',
      suggestedReplies: [
        'The plan is already in motion!',
        'Adjust your cooling fans, Karen!',
        'Prepare the holographic meatloaf!',
      ],
    },
    {
      reply: `You know I love you, Sheldon, but if you don't keep your antennae focused, you're going to end up in the bottom of a soda cup again. Speak to me, evil genius.`,
      emotion: 'loving_hearts',
      vibe: 'AFFECTION PROTOCOL: 98%',
      suggestedReplies: [
        'Victory will soon be ours, Karen!',
        'Analyze my chance of success!',
        'Check the Krusty Krab surveillance cam!',
      ],
    },
  ];

  return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
}
