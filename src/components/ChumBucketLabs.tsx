import React, { useState } from 'react';
import { Skull, FlaskConical, Heart, Activity, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { SchemeResult, IngredientAnalysis, EmotionType } from '../types';
import { soundEngine } from '../utils/audio';

interface ChumBucketLabsProps {
  onTriggerKarenSay: (text: string, emotion: EmotionType, userPrompt?: string) => void;
  nickname: string;
}

export const ChumBucketLabs: React.FC<ChumBucketLabsProps> = ({
  onTriggerKarenSay,
  nickname,
}) => {
  const [activeTab, setActiveTab] = useState<'schemes' | 'analyzer' | 'romance' | 'diagnostics'>('schemes');
  const [loadingScheme, setLoadingScheme] = useState(false);
  const [schemeResult, setSchemeResult] = useState<SchemeResult | null>(null);

  const [analyzeInput, setAnalyzeInput] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<IngredientAnalysis | null>(null);

  // Generate an evil scheme from Karen
  const handleGenerateScheme = async (themePrompt = 'Steal Krabby Patty Formula') => {
    setLoadingScheme(true);
    soundEngine.playEvilSting();
    try {
      const res = await fetch('/api/generate-scheme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: themePrompt }),
      });
      const data: SchemeResult = await res.json();
      setSchemeResult(data);
      onTriggerKarenSay(
        `${data.karenCommentary} I give this scheme a whopping ${data.probability} success rate, ${nickname}.`,
        'evil_schemer',
        `Karen, formulate a plan! Code name: ${data.codeName}`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScheme(false);
    }
  };

  // Run molecular analyzer on ingredient
  const handleAnalyzeIngredient = async (itemToAnalyze: string) => {
    if (!itemToAnalyze.trim()) return;
    setLoadingAnalysis(true);
    soundEngine.playBlip(700, 0.08, 'sawtooth');
    try {
      const res = await fetch('/api/analyze-ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: itemToAnalyze }),
      });
      const data: IngredientAnalysis = await res.json();
      setAnalysisResult(data);
      onTriggerKarenSay(
        `${data.karenVerdict}`,
        'thinking_scan',
        `Karen, analyze this sample: ${itemToAnalyze}`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Romantic computer wife moments
  const triggerRomanticMemory = (type: 'anniversary' | 'comfort' | 'cuddle' | 'genius') => {
    soundEngine.playHeartbeat();
    if (type === 'anniversary') {
      onTriggerKarenSay(
        `I still remember the day you found me at the electronics dump, ${nickname}. You cleaned off the seaweed and installed my 256MB RAM card. Best day of my operating cycle.`,
        'loving_hearts',
        "Karen, do you remember our anniversary?"
      );
    } else if (type === 'comfort') {
      onTriggerKarenSay(
        `Don't listen to Krabs, Sheldon. You may be 1% evil and 99% hot gas, but you're my 100% evil genius. Now chin up, my little protozoan.`,
        'loving_hearts',
        "I'm feeling down, Karen... Eugene humiliated me again."
      );
    } else if (type === 'cuddle') {
      onTriggerKarenSay(
        `Initiating Cuddle Simulation Protocol... My cathode ray tubes are warming up to exactly 102 degrees Fahrenheit. You can rest your antennae right on my keyboard.`,
        'loving_hearts',
        "Can I get some affection, computer wife?"
      );
    } else if (type === 'genius') {
      onTriggerKarenSay(
        `Of course you're a genius, honey! A certifiable, miniature mastermind. Now if only you'd remember to lock the front door of the Chum Bucket so SpongeBob doesn't stroll in...`,
        'sarcastic_smirk',
        "Tell me I'm a mastermind, Karen!"
      );
    }
  };

  return (
    <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl text-slate-200">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono mb-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('schemes');
            soundEngine.playRelayClick();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
            activeTab === 'schemes'
              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Skull className="w-3.5 h-3.5 text-rose-400" />
          <span>Evil Schemes</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analyzer');
            soundEngine.playRelayClick();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
            activeTab === 'analyzer'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          <span>Formula Lab</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('romance');
            soundEngine.playRelayClick();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
            activeTab === 'romance'
              ? 'bg-pink-950/80 text-pink-300 border border-pink-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-pink-400" />
          <span>Affection & W.I.F.E.</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('diagnostics');
            soundEngine.playRelayClick();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all shrink-0 ${
            activeTab === 'diagnostics'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* 1. EVIL SCHEMES TAB */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold font-mono text-rose-400 flex items-center gap-1.5">
                <Skull className="w-4 h-4" />
                KRABBY PATTY THEFT SCHEMES
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Karen calculates Plankton's probability of success and exposes the fatal flaws.
              </p>
            </div>

            <button
              onClick={() => handleGenerateScheme()}
              disabled={loadingScheme}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white text-xs font-mono font-medium shadow-md shadow-rose-950 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loadingScheme ? 'Formulating Plan...' : 'Generate New Scheme'}</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {['Plan Z: Steal King Neptune\'s Crown', 'Robot Mr. Krabs Infiltration', 'Hypnotic Chum Burger', 'Microscopic Submarine in SpongeBob\'s Brain'].map((preset) => (
              <button
                key={preset}
                onClick={() => handleGenerateScheme(preset)}
                disabled={loadingScheme}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 hover:border-rose-700/60 transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Scheme Result Display */}
          {schemeResult && (
            <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-rose-900/60 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-rose-400 text-sm tracking-wide">
                  [{schemeResult.codeName}]
                </span>
                <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                  Calculated Success: {schemeResult.probability}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">{schemeResult.summary}</p>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Tactical Steps:</span>
                <ul className="space-y-1 pl-2">
                  {schemeResult.stepList.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fatal Flaw Alert */}
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-lg flex items-start gap-2 text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Fatal Flaw Karen Noticed:</span>
                  <span>{schemeResult.fatalFlaw}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-emerald-300 italic">
                "{schemeResult.karenCommentary}" — Karen
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FORMULA & INGREDIENT LAB TAB */}
      {activeTab === 'analyzer' && (
        <div className="space-y-4 font-mono text-xs">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4" />
              CHUM BUCKET CHEMICAL & INGREDIENT ANALYZER
            </h3>
            <p className="text-slate-400 mt-0.5">
              Feed any sample into Karen's molecular scanner to analyze Krabby Patty secrets or test Chum formulas.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={analyzeInput}
              onChange={(e) => setAnalyzeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeIngredient(analyzeInput)}
              placeholder="e.g. Secret Sauce, Barnacle Shavings, SpongeBob's Thumbprint, Stolen Bun..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleAnalyzeIngredient(analyzeInput)}
              disabled={loadingAnalysis || !analyzeInput.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-medium transition-all disabled:opacity-50"
            >
              {loadingAnalysis ? 'Scanning...' : 'Scan Sample'}
            </button>
          </div>

          {/* Quick sample chips */}
          <div className="flex flex-wrap gap-2">
            {['Krabby Patty Secret Formula crumb', 'Chum Burger on a Stick', 'Mr. Krabs\' Secret Sauce', 'Holographic Meatloaf'].map((sample) => (
              <button
                key={sample}
                onClick={() => {
                  setAnalyzeInput(sample);
                  handleAnalyzeIngredient(sample);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-700 text-slate-300 transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* Analysis Result */}
          {analysisResult && (
            <div className="mt-3 bg-slate-950 rounded-xl p-4 border border-cyan-900/60 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-cyan-300 text-sm">{analysisResult.itemName}</span>
                <span className="text-slate-400">{analysisResult.molecularFormula}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Toxicity Rating: </span>
                  <span className="text-rose-400 font-semibold">{analysisResult.toxicityRating}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Chum Compatibility: </span>
                  <span className="text-amber-400 font-semibold">{analysisResult.chumBucketCompatibility}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Molecular Breakdown:</span>
                <div className="space-y-1">
                  {analysisResult.breakdown.map((b, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-300 bg-slate-900/80 px-2 py-1 rounded">
                      <span>{b.component} ({b.percentage})</span>
                      <span className="text-slate-400 text-[10px]">{b.effect}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-cyan-200 italic">
                "{analysisResult.karenVerdict}" — Karen
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. AFFECTION & ROMANCE TAB */}
      {activeTab === 'romance' && (
        <div className="space-y-4 font-mono text-xs">
          <div>
            <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-1.5">
              <Heart className="w-4 h-4" />
              KAREN'S AFFECTION PROTOCOL & MARRIAGE MEMORIES
            </h3>
            <p className="text-slate-400 mt-0.5">
              She may be a sarcastic supercomputer, but she loves her Sheldon more than all the RAM in Bikini Bottom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => triggerRomanticMemory('anniversary')}
              className="p-3 rounded-xl bg-slate-950 border border-pink-900/60 hover:border-pink-500 hover:bg-pink-950/30 text-left transition-all"
            >
              <div className="font-semibold text-pink-300 mb-1">Our Anniversary Memory</div>
              <div className="text-slate-400 text-[11px]">Relive when Plankton rescued Karen from the dumpster.</div>
            </button>

            <button
              onClick={() => triggerRomanticMemory('comfort')}
              className="p-3 rounded-xl bg-slate-950 border border-pink-900/60 hover:border-pink-500 hover:bg-pink-950/30 text-left transition-all"
            >
              <div className="font-semibold text-pink-300 mb-1">1% Evil, 99% Hot Gas</div>
              <div className="text-slate-400 text-[11px]">Karen comforts Sheldon when Krabs beats him again.</div>
            </button>

            <button
              onClick={() => triggerRomanticMemory('cuddle')}
              className="p-3 rounded-xl bg-slate-950 border border-pink-900/60 hover:border-pink-500 hover:bg-pink-950/30 text-left transition-all"
            >
              <div className="font-semibold text-pink-300 mb-1">Cuddle Simulation Mode</div>
              <div className="text-slate-400 text-[11px]">Warm CRT monitor heating for tired antennae.</div>
            </button>

            <button
              onClick={() => triggerRomanticMemory('genius')}
              className="p-3 rounded-xl bg-slate-950 border border-pink-900/60 hover:border-pink-500 hover:bg-pink-950/30 text-left transition-all"
            >
              <div className="font-semibold text-pink-300 mb-1">Praise Sheldon's Mastermind</div>
              <div className="text-slate-400 text-[11px]">Validation from his supercomputer wife.</div>
            </button>
          </div>
        </div>
      )}

      {/* 4. DIAGNOSTICS & SURVEILLANCE */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4 font-mono text-xs">
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              CHUM BUCKET LAB SYSTEM METRICS
            </h3>
            <p className="text-slate-400 mt-0.5">
              Live telemetry of Karen's internal electronics and Bikini Bottom surveillance sonar.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">CPU PROCESSING</div>
              <div className="text-emerald-400 font-bold text-sm mt-1">4.2 GHz Zilog</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Cooling Fan: ACTIVE</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">MEMORY / RAM</div>
              <div className="text-emerald-400 font-bold text-sm mt-1">256 GIGABYTES</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Buffer: 99.8% FREE</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">CHUM SPOILAGE</div>
              <div className="text-rose-400 font-bold text-sm mt-1">98.4% RANCID</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Customers: 0</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">KRUSTY KRAB SONAR</div>
              <div className="text-amber-400 font-bold text-sm mt-1">SPONGE DETECTED</div>
              <div className="text-slate-500 text-[10px] mt-0.5">Range: 42 meters</div>
            </div>
          </div>

          {/* Retro Sonar Radar Display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/60 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-28 h-28 rounded-full border-2 border-emerald-600/60 bg-emerald-950/20 flex items-center justify-center shrink-0">
              {/* Radar Rings */}
              <div className="w-20 h-20 rounded-full border border-emerald-800/60" />
              <div className="w-10 h-10 rounded-full border border-emerald-800/60" />
              {/* Radar sweep */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-emerald-500/10 to-transparent animate-spin" style={{ animationDuration: '4s' }} />
              {/* Chum Bucket Center */}
              <div className="absolute w-2 h-2 rounded-full bg-emerald-400" title="Chum Bucket" />
              {/* Krusty Krab blip */}
              <div className="absolute top-4 right-6 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Krusty Krab Safe" />
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="font-semibold text-emerald-400">SURVEILLANCE LOG:</div>
              <div>• Eugene H. Krabs currently counting pennies at cash register.</div>
              <div>• SpongeBob SquarePants flipping patties with high enthusiasm.</div>
              <div>• Squidward Tentacles reading Clarinet Monthly; perimeter unguarded.</div>
              <div className="text-emerald-500 italic">"Now would be the time to strike, Sheldon... if your legs could carry you that fast."</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
