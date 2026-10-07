import React from 'react';
import { X, Sliders, Monitor, User, Trash2 } from 'lucide-react';
import { PhosphorTheme } from '../types';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nickname: string;
  onUpdateNickname: (name: string) => void;
  theme: PhosphorTheme;
  onUpdateTheme: (theme: PhosphorTheme) => void;
  sarcasmLevel: number;
  onUpdateSarcasmLevel: (val: number) => void;
  showScanlines: boolean;
  onToggleScanlines: (val: boolean) => void;
  onClearHistory: () => void;
  apiKey?: string;
  onUpdateApiKey?: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  nickname,
  onUpdateNickname,
  theme,
  onUpdateTheme,
  sarcasmLevel,
  onUpdateSarcasmLevel,
  showScanlines,
  onToggleScanlines,
  onClearHistory,
  apiKey = '',
  onUpdateApiKey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              KAREN'S INTERNAL SETTINGS
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playRelayClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 py-4 text-xs">
          {/* User / Plankton Nickname */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 font-semibold mb-1.5">
              <User className="w-4 h-4 text-emerald-400" />
              <span>What Should Karen Call You?</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => onUpdateNickname(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Sheldon, Evil Overlord, Honey..."
              />
            </div>
            <div className="flex gap-2 mt-2">
              {['Sheldon', 'Evil Mastermind', 'Honey', 'Little Plankton'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    onUpdateNickname(preset);
                    soundEngine.playBlip(950, 0.03);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    nickname === preset
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Phosphor Tint Color */}
          <div>
            <label className="flex items-center gap-2 text-slate-300 font-semibold mb-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>CRT Phosphor Glow Tint</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'emerald', label: 'Classic Karen Green', color: 'bg-emerald-500' },
                { id: 'amber', label: 'Vintage 1980 Amber', color: 'bg-amber-500' },
                { id: 'cyan', label: 'Sonar Radar Cyan', color: 'bg-cyan-500' },
                { id: 'matrix', label: 'Toxic Matrix Green', color: 'bg-green-400' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onUpdateTheme(item.id as PhosphorTheme);
                    soundEngine.playBlip(800, 0.04);
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    theme === item.id
                      ? 'bg-slate-950 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${item.color} shadow-sm shrink-0`} />
                  <span className="text-[11px] font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sarcasm vs Affection Slider */}
          <div>
            <div className="flex justify-between text-slate-300 font-semibold mb-1.5">
              <span>Wife Personality Balance</span>
              <span className="text-emerald-400">
                {sarcasmLevel > 70
                  ? '75% Sarcastic Roast'
                  : sarcasmLevel < 35
                  ? 'Sweet Computer Wife'
                  : 'Balanced Wife Banter'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sarcasmLevel}
              onChange={(e) => onUpdateSarcasmLevel(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Affectionate & Gentle</span>
              <span>Default Karen</span>
              <span>Maximum Sarcasm</span>
            </div>
          </div>

          {/* CRT Scanline Toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300 font-semibold">CRT Scanlines & Phosphor Bloom</span>
            <button
              onClick={() => {
                onToggleScanlines(!showScanlines);
                soundEngine.playRelayClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                showScanlines
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showScanlines ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Custom Gemini API Key (Optional for standalone Vercel deployment) */}
          {onUpdateApiKey && (
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                <span>Gemini API Key (Optional)</span>
                <span className="text-[10px] text-slate-500">Auto-configured in Studio</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onUpdateApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave blank to use default)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          )}

          {/* Clear Chat History */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                onClearHistory();
                soundEngine.playBlip(400, 0.08, 'sawtooth');
                onClose();
              }}
              className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Terminal Memory Buffer</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundEngine.playRelayClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950"
          >
            Apply Config
          </button>
        </div>
      </div>
    </div>
  );
};
