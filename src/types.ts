export type EmotionType = 
  | 'neutral_wave'
  | 'happy_smile'
  | 'loving_hearts'
  | 'sarcastic_smirk'
  | 'evil_schemer'
  | 'thinking_scan'
  | 'annoyed_frown'
  | 'laughing';

export type ChassisType = 'wall' | 'mobile' | 'terminal';

export type PhosphorTheme = 'emerald' | 'amber' | 'cyan' | 'matrix';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'karen';
  text: string;
  emotion?: EmotionType;
  timestamp: string;
  vibe?: string;
}

export interface SchemeResult {
  codeName: string;
  summary: string;
  stepList: string[];
  probability: string;
  fatalFlaw: string;
  karenCommentary: string;
  equipmentNeeded: string[];
}

export interface IngredientAnalysis {
  itemName: string;
  molecularFormula: string;
  breakdown: Array<{
    component: string;
    percentage: string;
    effect: string;
  }>;
  toxicityRating: string;
  chumBucketCompatibility: string;
  karenVerdict: string;
}
