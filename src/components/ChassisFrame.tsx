import React from 'react';
import { ChassisType } from '../types';

interface ChassisFrameProps {
  chassis: ChassisType;
  isSpeaking: boolean;
  statusText?: string;
  onToggleChassis: (mode: ChassisType) => void;
  children: React.ReactNode;
}

export const ChassisFrame: React.FC<ChassisFrameProps> = ({
  chassis,
  isSpeaking,
  statusText = 'SYSTEMS OPERATIONAL',
  onToggleChassis,
  children,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto transition-all duration-300">
      {/* Mobile Chassis Top Antenna (if mobile mode) */}
      {chassis === 'mobile' && (
        <div className="flex flex-col items-center mb-1 animate-pulse">
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] border-2 border-emerald-300" />
          <div className="w-1.5 h-12 bg-gradient-to-b from-slate-400 via-slate-600 to-slate-800 border-x border-slate-900" />
        </div>
      )}

      {/* Main Monitor Housing */}
      <div className="relative w-full bg-gradient-to-b from-slate-800 via-slate-900 to-zinc-950 p-4 md:p-6 rounded-3xl border-4 border-slate-700 shadow-2xl shadow-black">
        {/* Chassis Bolt Accents */}
        <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 shadow-inner" />

        {/* Top Header Panel: Chum Bucket branding & Chassis Badge */}
        <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-emerald-400 font-pixel text-[10px]">
              KAREN · W.I.F.E.
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">CHUM BUCKET LAB v2.4</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Blinking Logic LEDs */}
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isSpeaking ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-emerald-800'
                }`}
                title="Voice Activity"
              />
              <span
                className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b] animate-ping"
                style={{ animationDuration: '3s' }}
                title="Logic Processing"
              />
              <span
                className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_6px_#e11d48]"
                title="Evil Scheme Subsystem"
              />
            </div>

            {/* Chassis Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => onToggleChassis('wall')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chassis === 'wall'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Laboratory Wall Mount"
              >
                Wall
              </button>
              <button
                onClick={() => onToggleChassis('mobile')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chassis === 'mobile'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Rolling Chassis"
              >
                Mobile W.I.F.E.
              </button>
              <button
                onClick={() => onToggleChassis('terminal')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  chassis === 'terminal'
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Desktop Companion Console"
              >
                Desktop
              </button>
            </div>
          </div>
        </div>

        {/* Screen Bezel Housing with CRT Screen Canvas */}
        <div className="relative mt-3 p-3 md:p-5 bg-gradient-to-b from-zinc-950 via-slate-950 to-black rounded-2xl border-4 border-slate-800 shadow-inner">
          {/* Mobile Robot Arms on Sides (Iconic SpongeBob W.I.F.E.) */}
          {chassis === 'mobile' && (
            <>
              {/* Left Robot Arm */}
              <div className="absolute -left-7 top-1/3 flex flex-col items-center pointer-events-none transition-transform duration-300">
                <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-500 shadow-md" />
                <div className="w-2 h-16 bg-gradient-to-b from-slate-500 to-slate-700 border-x border-slate-800 origin-top rotate-[-12deg]" />
                <div className="w-4 h-4 rounded-sm bg-slate-600 border border-slate-400 rotate-45 shadow-sm" />
              </div>
              {/* Right Robot Arm */}
              <div className="absolute -right-7 top-1/3 flex flex-col items-center pointer-events-none transition-transform duration-300">
                <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-500 shadow-md" />
                <div className="w-2 h-16 bg-gradient-to-b from-slate-500 to-slate-700 border-x border-slate-800 origin-top rotate-[12deg]" />
                <div className="w-4 h-4 rounded-sm bg-slate-600 border border-slate-400 rotate-45 shadow-sm" />
              </div>
            </>
          )}

          {/* CRT Screen Aspect Ratio Container */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[460px] bg-black rounded-xl overflow-hidden border-2 border-emerald-950/60 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            {children}
          </div>
        </div>

        {/* Bottom Hardware Console Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          {/* Status readout ticker */}
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-semibold text-[11px] uppercase tracking-wider">
              {statusText}
            </span>
          </div>

          {/* Right hardware dials & specs */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>RAM: 256 GB</span>
              <span>·</span>
              <span>VACUUM TUBES: OK</span>
            </div>

            {/* Vintage power indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-slate-300 font-medium">ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Rolling Stand Base (W.I.F.E.) */}
      {chassis === 'mobile' && (
        <div className="flex flex-col items-center w-full max-w-md mt-2">
          {/* Telescoping Pole */}
          <div className="w-8 h-20 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 border-x-2 border-slate-900 rounded-sm shadow-lg" />
          
          {/* Caster Wheel Base with 4 rolling wheels */}
          <div className="relative w-72 h-10 bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl border-2 border-slate-800 shadow-xl flex items-center justify-between px-4">
            <div className="text-[10px] font-mono text-emerald-400 font-bold">W.I.F.E. BASE 01</div>
            {/* 4 Caster Wheels */}
            <div className="absolute -bottom-4 left-4 w-7 h-7 rounded-full bg-zinc-900 border-2 border-slate-500 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="absolute -bottom-4 left-24 w-7 h-7 rounded-full bg-zinc-900 border-2 border-slate-500 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="absolute -bottom-4 right-24 w-7 h-7 rounded-full bg-zinc-900 border-2 border-slate-500 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
            <div className="absolute -bottom-4 right-4 w-7 h-7 rounded-full bg-zinc-900 border-2 border-slate-500 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* Wall Conduit Pipes (if wall mount) */}
      {chassis === 'wall' && (
        <div className="flex items-center justify-center w-full max-w-sm gap-8 -mt-1 opacity-70">
          <div className="w-4 h-6 bg-slate-800 border-x border-slate-700" />
          <div className="w-6 h-8 bg-zinc-800 border-x border-zinc-700" />
          <div className="w-4 h-6 bg-slate-800 border-x border-slate-700" />
        </div>
      )}
    </div>
  );
};
