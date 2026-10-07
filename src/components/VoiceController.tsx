import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface VoiceControllerProps {
  onTranscript: (text: string) => void;
  isKarenSpeaking: boolean;
  onStopKarenSpeaking: () => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  onTranscript,
  isKarenSpeaking,
  onStopKarenSpeaking,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      soundEngine.playBlip(1200, 0.04);
    };

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setLiveTranscript(currentText);

      // If final result
      if (event.results[0].isFinal) {
        if (currentText.trim()) {
          onTranscript(currentText.trim());
          setLiveTranscript('');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      setLiveTranscript('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. You can type in the terminal below!');
      return;
    }

    if (isKarenSpeaking) {
      onStopKarenSpeaking();
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      soundEngine.playRelayClick();
    } else {
      try {
        setLiveTranscript('');
        recognitionRef.current?.start();
        soundEngine.playBlip(900, 0.05);
      } catch (e) {
        console.warn('Recognition start failed:', e);
      }
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
    if (nextMute && isKarenSpeaking) {
      onStopKarenSpeaking();
    }
    soundEngine.playRelayClick();
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-lg">
      {/* Mic Input Button */}
      <button
        onClick={toggleListening}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
          isListening
            ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
            : 'bg-emerald-950/70 text-emerald-400 border border-emerald-700/50 hover:bg-emerald-900/60'
        }`}
        title={speechSupported ? 'Click to speak to Karen' : 'Speech recognition not supported'}
      >
        {isListening ? (
          <>
            <Radio className="w-4 h-4 animate-spin text-rose-200" />
            <span>Listening to Sheldon...</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Voice Input</span>
          </>
        )}
      </button>

      {/* Live voice transcript preview */}
      {liveTranscript && (
        <div className="hidden sm:block text-xs font-mono text-emerald-300 italic max-w-xs truncate animate-pulse">
          "{liveTranscript}"
        </div>
      )}

      {/* Speaking Stop Button if Karen is talking */}
      {isKarenSpeaking && (
        <button
          onClick={onStopKarenSpeaking}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono hover:bg-amber-500/30 transition-colors"
          title="Stop Karen's voice"
        >
          <span>Interrupt</span>
        </button>
      )}

      {/* Audio Mute/Unmute */}
      <button
        onClick={toggleMute}
        className={`p-2 rounded-lg text-xs font-mono transition-colors ${
          isMuted
            ? 'bg-rose-950 text-rose-400 border border-rose-800'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
        title={isMuted ? 'Unmute Sound & Voice' : 'Mute Sound & Voice'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
