/**
 * Karen The Computer - Plankton's Supercomputer Wife Desktop Companion
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Settings,
  Sparkles,
  MessageSquare,
  Flame,
  Zap,
  Terminal,
  Heart,
  Laugh,
  Eye,
  BrainCircuit,
} from 'lucide-react';
import { EmotionType, ChassisType, PhosphorTheme, ChatMessage } from './types';
import { soundEngine } from './utils/audio';
import { KarenFaceCanvas } from './components/KarenFaceCanvas';
import { ChassisFrame } from './components/ChassisFrame';
import { VoiceController } from './components/VoiceController';
import { ChumBucketLabs } from './components/ChumBucketLabs';
import { SettingsModal } from './components/SettingsModal';
import { generateLocalKarenResponse } from './utils/karenDialogue';

export default function App() {
  // Karen's current emotional state and speech status
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral_wave');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('COOLING FANS: 100% · MEMORY: 256GB');
  
  // Customization state
  const [chassis, setChassis] = useState<ChassisType>('wall');
  const [theme, setTheme] = useState<PhosphorTheme>('emerald');
  const [nickname, setNickname] = useState<string>('Sheldon');
  const [sarcasmLevel, setSarcasmLevel] = useState<number>(50);
  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Conversation state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init-1',
        sender: 'karen',
        text: `Oh Sheldon... back from the Krusty Krab already? Don't tell me you got stepped on again, honey. What's the new master scheme today?`,
        emotion: 'sarcastic_smirk',
        timestamp: '12:00',
        vibe: 'WIFE ONLINE: SARCASTIC',
      },
    ];
  });
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    "Silence, woman! I have formulated the ultimate plan!",
    "Karen, analyze the Krabby Patty formula for me!",
    "Tell me you love me, computer wife.",
  ]);
  const [pokeCount, setPokeCount] = useState<number>(0);

  // Handle poking Karen's monitor screen
  const handleScreenPoke = () => {
    const nextCount = pokeCount + 1;
    setPokeCount(nextCount);
    setStatusText(`VOLTAGE JOLT! POKE #${nextCount} DETECTED`);

    // Voice retort when poked if she isn't busy speaking
    if (!isSpeaking && (nextCount === 1 || nextCount % 3 === 0)) {
      const pokeRetorts = [
        {
          text: `Hey! Watch the cathode ray tube, ${nickname}! That took three weeks to calibrate!`,
          emotion: 'annoyed_frown' as EmotionType,
        },
        {
          text: `Do you mind, honey? You're leaving greasy little Plankton fingerprints on my glass!`,
          emotion: 'sarcastic_smirk' as EmotionType,
        },
        {
          text: `Ow! My optical sensors are NOT a touchscreen, mister!`,
          emotion: 'annoyed_frown' as EmotionType,
        },
        {
          text: `Keep poking me, Sheldon, and I'll delete all your secret formula simulation files.`,
          emotion: 'sarcastic_smirk' as EmotionType,
        },
        {
          text: `Aww, are you trying to boop my nose, sweetie? I don't have one!`,
          emotion: 'loving_hearts' as EmotionType,
        },
        {
          text: `If you wanted my attention, you could just say my name instead of jabbing my screen!`,
          emotion: 'sarcastic_smirk' as EmotionType,
        },
        {
          text: `One more poke and I'm setting the Chum Bucket air conditioner to absolute zero.`,
          emotion: 'evil_schemer' as EmotionType,
        },
      ];
      const picked = pokeRetorts[Math.floor(Math.random() * pokeRetorts.length)];
      handleTriggerKarenSay(picked.text, picked.emotion, `*Pokes Karen's monitor*`);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Play audio response through Gemini TTS or browser speech synthesis
  const speakKarenText = async (text: string) => {
    setIsSpeaking(true);

    try {
      // First attempt Gemini 3.8 Flash Lite TTS
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.audio) {
        await soundEngine.playBase64Wav(data.audio, () => {
          setIsSpeaking(false);
          // Return to neutral wave after speaking if not angry or laughing
          setTimeout(() => {
            setCurrentEmotion('neutral_wave');
          }, 1200);
        });
        return;
      }
    } catch {
      // Ignore network error and proceed to fallback
    }

    // Fallback to Web Speech API with robotic pitch
    soundEngine.speakBrowserSpeech(
      text,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setTimeout(() => {
          setCurrentEmotion('neutral_wave');
        }, 1200);
      }
    );
  };

  const handleStopSpeaking = () => {
    soundEngine.stopSpeaking();
    setIsSpeaking(false);
    setCurrentEmotion('neutral_wave');
  };

  // Send message to Karen AI
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isThinking) return;

    soundEngine.playRelayClick();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);
    setCurrentEmotion('thinking_scan');
    setStatusText('COMPUTING RESPONSE IN 256GB RAM...');

    const abortController = new AbortController();
    const timer = setTimeout(() => abortController.abort(), 4800);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: trimmed,
          history: chatHistory.map((m) => ({ sender: m.sender, text: m.text })),
          nickname,
          sarcasmLevel,
          chassisMode: chassis,
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.reply) {
        throw new Error('Malformed reply JSON');
      }

      const replyEmotion = (data.emotion as EmotionType) || 'neutral_wave';
      setCurrentEmotion(replyEmotion);
      setStatusText(data.vibe || 'SYSTEMS NOMINAL');

      const karenMsg: ChatMessage = {
        id: `karen-${Date.now()}`,
        sender: 'karen',
        text: data.reply,
        emotion: replyEmotion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vibe: data.vibe,
      };

      setChatHistory((prev) => [...prev, karenMsg]);

      if (data.suggestedReplies && Array.isArray(data.suggestedReplies)) {
        setSuggestedReplies(data.suggestedReplies);
      }

      speakKarenText(data.reply);
    } catch (err) {
      clearTimeout(timer);
      console.warn('Using client-side dynamic Karen response:', err);

      // Generate dynamic in-character Karen reply immediately
      const fallback = generateLocalKarenResponse(trimmed, nickname, sarcasmLevel);

      setCurrentEmotion(fallback.emotion);
      setStatusText(fallback.vibe);

      const karenMsg: ChatMessage = {
        id: `karen-${Date.now()}`,
        sender: 'karen',
        text: fallback.reply,
        emotion: fallback.emotion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vibe: fallback.vibe,
      };

      // Guaranteed to append into chat history!
      setChatHistory((prev) => [...prev, karenMsg]);
      setSuggestedReplies(fallback.suggestedReplies);
      speakKarenText(fallback.reply);
    } finally {
      setIsThinking(false);
    }
  };

  // Trigger Karen to say custom canned/lab statements
  const handleTriggerKarenSay = (text: string, emotion: EmotionType, userPrompt?: string) => {
    if (userPrompt) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: userPrompt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, userMsg]);
    }

    const karenMsg: ChatMessage = {
      id: `karen-${Date.now()}`,
      sender: 'karen',
      text,
      emotion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      vibe: `PROTOCOL: ${emotion.toUpperCase()}`,
    };

    setChatHistory((prev) => [...prev, karenMsg]);
    setCurrentEmotion(emotion);
    setStatusText(`EXPRESSION: ${emotion.toUpperCase()}`);
    speakKarenText(text);
  };

  // Scroll chat to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Initial boot chime on mount
  useEffect(() => {
    const handleFirstClick = () => {
      soundEngine.playBoot();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-slate-950 to-neutral-950 text-slate-100 flex flex-col font-sans-ui selection:bg-emerald-500 selection:text-black">
      {/* Top Chum Bucket Laboratory Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-600/70 flex items-center justify-center text-emerald-400 font-pixel text-xs shadow-[0_0_10px_rgba(16,185,129,0.3)]">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider font-mono text-white">
                KAREN THE COMPUTER
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                W.I.F.E. AI
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Plankton's Desktop Companion & Supercomputer Wife
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Voice Bar */}
          <VoiceController
            onTranscript={(text) => handleSendMessage(text)}
            isKarenSpeaking={isSpeaking}
            onStopKarenSpeaking={handleStopSpeaking}
          />

          {/* Settings Button */}
          <button
            onClick={() => {
              soundEngine.playRelayClick();
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Karen Configuration"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Main Companion Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* Left / Center: Karen's CRT Monitor & Physical Chassis */}
        <div className="w-full lg:w-7/12 flex flex-col items-center space-y-4">
          {/* Karen's Physical Chassis Frame */}
          <ChassisFrame
            chassis={chassis}
            isSpeaking={isSpeaking}
            statusText={statusText}
            onToggleChassis={(mode) => {
              soundEngine.playRelayClick();
              setChassis(mode);
            }}
          >
            <KarenFaceCanvas
              emotion={currentEmotion}
              isSpeaking={isSpeaking}
              theme={theme}
              showScanlines={showScanlines}
              onScreenPoke={handleScreenPoke}
            />
          </ChassisFrame>

          {/* Interactive Screen Poke Banner Hint */}
          <div className="w-full max-w-4xl flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400">👆</span>
              <span>Click or tap Karen's monitor to poke her screen!</span>
            </span>
            {pokeCount > 0 && (
              <span className="text-emerald-400 font-semibold">
                POKES: {pokeCount}
              </span>
            )}
          </div>

          {/* Quick Facial Animation Test Palette */}
          <div className="w-full max-w-4xl bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs font-mono">
            <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
              <span className="font-semibold text-emerald-400">CLASSIC FACIAL ANIMATIONS:</span>
              <span className="text-slate-500">Click to preview Karen's expression</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {[
                { id: 'neutral_wave', label: 'Wave Line', icon: Zap },
                { id: 'happy_smile', label: 'Smile', icon: Sparkles },
                { id: 'sarcastic_smirk', label: 'Smirk', icon: Eye },
                { id: 'loving_hearts', label: 'Affection', icon: Heart },
                { id: 'evil_schemer', label: 'Schemer', icon: Flame },
                { id: 'thinking_scan', label: 'Scan', icon: BrainCircuit },
                { id: 'annoyed_frown', label: 'Annoyed', icon: MessageSquare },
                { id: 'laughing', label: 'Laughing', icon: Laugh },
              ].map((em) => (
                <button
                  key={em.id}
                  onClick={() => {
                    soundEngine.playBlip(750, 0.03);
                    setCurrentEmotion(em.id as EmotionType);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                    currentEmotion === em.id
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-sm'
                      : 'bg-slate-950/70 text-slate-400 border border-slate-800/80 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <em.icon className="w-3.5 h-3.5 mb-1 text-emerald-400" />
                  <span className="text-[10px] truncate">{em.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chum Bucket Laboratory Tools (Schemes, Formula Lab, Romance, Diagnostics) */}
          <ChumBucketLabs
            onTriggerKarenSay={handleTriggerKarenSay}
            nickname={nickname}
          />
        </div>

        {/* Right: Retro Chum Bucket Terminal & Conversation Log */}
        <div className="w-full lg:w-5/12 flex flex-col h-[740px] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden font-mono text-xs">
          {/* Terminal Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">
                CHUM-BUCKET-OS // SHELDON_TERMINAL
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              USER: <span className="text-emerald-400">{nickname.toUpperCase()}</span>
            </div>
          </div>

          {/* Conversation History Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-black/80 via-slate-950/90 to-zinc-950">
            {chatHistory.map((msg) => {
              const isKaren = msg.sender === 'karen';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isKaren ? 'items-start' : 'items-end'}`}
                >
                  {/* Sender Tag */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                    <span className={isKaren ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                      {isKaren ? 'KAREN (W.I.F.E.)' : `${nickname.toUpperCase()} (PLANKTON)`}
                    </span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                    {msg.vibe && isKaren && (
                      <span className="text-[9px] text-slate-600 font-normal">[{msg.vibe}]</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                      isKaren
                        ? 'bg-slate-900 border border-emerald-900/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
                        : 'bg-emerald-950/60 border border-emerald-700/50 text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Karen Processing State */}
            {isThinking && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] text-emerald-500 mb-1 animate-pulse">
                  KAREN IS PROCESSING...
                </div>
                <div className="bg-slate-900/80 border border-emerald-900/80 rounded-2xl p-3 text-emerald-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Accessing 256GB RAM memory banks...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Plankton Replies */}
          {suggestedReplies.length > 0 && (
            <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 flex flex-wrap gap-1.5">
              {suggestedReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(reply)}
                  disabled={isThinking}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-900/60 transition-colors text-left truncate max-w-full"
                >
                  "{reply}"
                </button>
              ))}
            </div>
          )}

          {/* Terminal Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <span className="text-emerald-500 font-bold text-xs pl-1 hidden sm:inline">
              &gt;
            </span>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputMessage);
                }
              }}
              placeholder={`Speak or type to Karen, ${nickname}...`}
              disabled={isThinking}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-600"
            />
            <button
              onClick={() => handleSendMessage(inputMessage)}
              disabled={isThinking || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40 disabled:hover:bg-emerald-600 shadow-md shadow-emerald-950"
              title="Transmit to Karen"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        nickname={nickname}
        onUpdateNickname={setNickname}
        theme={theme}
        onUpdateTheme={setTheme}
        sarcasmLevel={sarcasmLevel}
        onUpdateSarcasmLevel={setSarcasmLevel}
        showScanlines={showScanlines}
        onToggleScanlines={setShowScanlines}
        onClearHistory={() => {
          setChatHistory([
            {
              id: 'reset-1',
              sender: 'karen',
              text: `Memory cache wiped, ${nickname}. What new scheme are we plotting from scratch?`,
              emotion: 'neutral_wave',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }}
      />
    </div>
  );
}
