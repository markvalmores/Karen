import React, { useEffect, useRef, useState } from 'react';
import { EmotionType, PhosphorTheme } from '../types';
import { soundEngine } from '../utils/audio';

interface KarenFaceCanvasProps {
  emotion: EmotionType;
  isSpeaking: boolean;
  theme?: PhosphorTheme;
  showScanlines?: boolean;
  onScreenPoke?: (pos: { x: number; y: number }) => void;
}

interface PokeRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface PokeSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export const KarenFaceCanvas: React.FC<KarenFaceCanvasProps> = ({
  emotion,
  isSpeaking,
  theme = 'emerald',
  showScanlines = true,
  onScreenPoke,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Poking ripple and shockwave state
  const ripplesRef = useRef<PokeRipple[]>([]);
  const sparksRef = useRef<PokeSpark[]>([]);
  const startleRef = useRef<number>(0); // 0 to 1 startle reflex
  const screenShakeRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pokeTip, setPokeTip] = useState<string | null>(null);

  // Phosphor color palettes
  const colorMap = {
    emerald: {
      primary: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.85)',
      dim: 'rgba(21, 128, 61, 0.35)',
      bg: '#041308',
      clear: 'rgba(3, 15, 6, 0.32)',
      highlight: '#86efac',
      whiteGlow: '#dcfce7',
    },
    amber: {
      primary: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.85)',
      dim: 'rgba(180, 83, 9, 0.35)',
      bg: '#140c03',
      clear: 'rgba(15, 8, 2, 0.32)',
      highlight: '#fde68a',
      whiteGlow: '#fef3c7',
    },
    cyan: {
      primary: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.85)',
      dim: 'rgba(14, 116, 144, 0.35)',
      bg: '#021117',
      clear: 'rgba(2, 13, 18, 0.32)',
      highlight: '#a5f3fc',
      whiteGlow: '#cffafe',
    },
    matrix: {
      primary: '#00ff66',
      glow: 'rgba(0, 255, 102, 0.95)',
      dim: 'rgba(0, 180, 70, 0.4)',
      bg: '#001004',
      clear: 'rgba(0, 14, 4, 0.32)',
      highlight: '#bbf7d0',
      whiteGlow: '#f0fdf4',
    },
  };

  const colors = colorMap[theme] || colorMap.emerald;

  // Track mouse movements across monitor for gaze tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    mousePosRef.current = { x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) };
  };

  const handleMouseLeave = () => {
    mousePosRef.current = { x: 0, y: 0 };
  };

  // Screen Poke Click Event
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pokeX = (e.clientX - rect.left) * scaleX;
    const pokeY = (e.clientY - rect.top) * scaleY;

    // Trigger procedural poke sound
    soundEngine.playPoke();

    // Trigger startle animation
    startleRef.current = 1.0;

    // Add screen shake
    screenShakeRef.current = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    };

    // Add concentric shockwave ripples
    ripplesRef.current.push(
      {
        x: pokeX,
        y: pokeY,
        radius: 4,
        maxRadius: 130,
        alpha: 1.0,
        color: colors.highlight,
      },
      {
        x: pokeX,
        y: pokeY,
        radius: 2,
        maxRadius: 80,
        alpha: 0.85,
        color: colors.primary,
      }
    );

    // Spawn 14 glowing phosphor sparks
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.4;
      const speed = 2 + Math.random() * 4.5;
      sparksRef.current.push({
        x: pokeX,
        y: pokeY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: 0.35 + Math.random() * 0.25,
        size: 2.5 + Math.random() * 2,
      });
    }

    // Brief floating poke indicator text
    const funnyPokes = ['*POKE*', '*BOOP!*', 'ZAP!', '*CLINK*', 'OUCH!'];
    setPokeTip(funnyPokes[Math.floor(Math.random() * funnyPokes.length)]);
    setTimeout(() => setPokeTip(null), 700);

    // Notify parent
    if (onScreenPoke) {
      onScreenPoke({ x: pokeX, y: pokeY });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let smoothGazeX = 0;
    let smoothGazeY = 0;
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkPhase = 0;

    const analyser = soundEngine.getAnalyser();
    const dataArray = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);

    // Initial fill
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Decay startle reflex
      if (startleRef.current > 0) {
        startleRef.current = Math.max(0, startleRef.current - 0.06);
      }
      // Decay screen shake
      screenShakeRef.current.x *= 0.75;
      screenShakeRef.current.y *= 0.75;

      // Smooth gaze interpolation
      smoothGazeX += (mousePosRef.current.x - smoothGazeX) * 0.08;
      smoothGazeY += (mousePosRef.current.y - smoothGazeY) * 0.08;

      // Periodic blinking calculation
      blinkTimer += 0.04;
      if (blinkTimer > 3.8 + Math.sin(time * 0.5) * 1.2) {
        isBlinking = true;
        blinkTimer = 0;
        blinkPhase = 0;
      }
      if (isBlinking) {
        blinkPhase += 0.22;
        if (blinkPhase >= Math.PI) {
          isBlinking = false;
          blinkPhase = 0;
        }
      }
      // If poked, Karen winces (blink closes quickly)
      const pokeBlink = startleRef.current > 0.4 ? 0.05 : 1;
      const naturalBlink = isBlinking ? Math.max(0, 1 - Math.sin(blinkPhase) * 1.1) : 1;
      const blinkOpen = Math.min(pokeBlink, naturalBlink);

      // CRT phosphor decay trail
      ctx.fillStyle = colors.clear;
      ctx.fillRect(0, 0, width, height);

      // Apply screen shake translation
      ctx.save();
      ctx.translate(screenShakeRef.current.x, screenShakeRef.current.y);

      // Subtle background phosphor dot grid
      ctx.fillStyle = colors.dim;
      for (let x = 0; x < width; x += 18) {
        for (let y = 0; y < height; y += 18) {
          ctx.fillRect(x, y, 1.2, 1.2);
        }
      }

      // Voice level analysis
      let audioLevel = 0;
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < 32; i++) {
          sum += dataArray[i];
        }
        audioLevel = sum / (32 * 255);
      }

      // Synthesized vocal cadence when speaking or electric startle jump
      const vocalPulse = isSpeaking
        ? Math.max(audioLevel * 2.8, Math.sin(time * 14) * 0.4 + Math.sin(time * 26) * 0.3 + 0.45)
        : startleRef.current * 0.7 + 0.04;

      ctx.shadowBlur = 14;
      ctx.shadowColor = colors.glow;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. DRAW KAREN'S EYES & EYEBROWS (with startle reflex)
      drawKarenEyes(
        ctx,
        width,
        centerY - 55,
        time,
        emotion,
        blinkOpen,
        smoothGazeX,
        smoothGazeY,
        startleRef.current,
        colors
      );

      // 2. DRAW KAREN'S OSCILLOSCOPE MOUTH WAVE
      drawKarenOscilloscopeMouth(
        ctx,
        width,
        centerY + 55,
        time,
        emotion,
        vocalPulse,
        isSpeaking,
        startleRef.current,
        colors
      );

      // 3. DRAW AND UPDATE POKE RIPPLES
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 5.5;
        r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 3.5 * r.alpha;
        ctx.shadowBlur = 16 * r.alpha;
        ctx.shadowColor = colors.glow;
        ctx.globalAlpha = r.alpha;
        ctx.stroke();

        // Crosshair glitch lines at center of poke
        if (r.radius < 45) {
          ctx.beginPath();
          ctx.moveTo(r.x - 12, r.y);
          ctx.lineTo(r.x + 12, r.y);
          ctx.moveTo(r.x, r.y - 12);
          ctx.lineTo(r.x, r.y + 12);
          ctx.lineWidth = 2 * r.alpha;
          ctx.stroke();
        }

        ctx.restore();

        if (r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
        }
      }

      // 4. DRAW AND UPDATE POKE PHOSPHOR SPARKS
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const s = sparksRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.04 / s.maxLife;

        if (s.life <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = colors.whiteGlow;
        ctx.shadowBlur = 8;
        ctx.shadowColor = colors.glow;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillRect(s.x, s.y, s.size, s.size);
        ctx.restore();
      }

      ctx.restore(); // restore screen shake

      // CRT Scanlines effect
      if (showScanlines) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.5);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [emotion, isSpeaking, theme, showScanlines]);

  /**
   * KAREN'S AUTHENTIC EYES & EYELASHES (with poke startle support)
   */
  const drawKarenEyes = (
    ctx: CanvasRenderingContext2D,
    width: number,
    baseY: number,
    time: number,
    currentEmotion: EmotionType,
    blinkOpen: number,
    gazeX: number,
    gazeY: number,
    startle: number,
    colors: any
  ) => {
    const eyeSpacing = 95;
    const leftEyeX = width / 2 - eyeSpacing;
    const rightEyeX = width / 2 + eyeSpacing;
    const eyeWidth = 52 + (startle > 0.5 ? 4 : 0);
    const eyeHeight = 44 * Math.max(0.08, blinkOpen);

    let pupilOffsetX = gazeX * 9;
    let pupilOffsetY = gazeY * 6;
    let leftLidDrop = 0;
    let rightLidDrop = 0;
    let leftBrowY = baseY - 36 - startle * 8;
    let rightBrowY = baseY - 36 - startle * 8;
    let leftBrowAngle = 0;
    let rightBrowAngle = 0;
    let isHeartEyes = false;
    let isVillainGlance = false;
    let isEyeRolling = false;
    let isSquintLaugh = false;

    // Startle reflex pulls eyebrows up and jitters pupils
    if (startle > 0.2) {
      pupilOffsetX += (Math.random() - 0.5) * 6;
      pupilOffsetY += (Math.random() - 0.5) * 6;
    }

    switch (currentEmotion) {
      case 'sarcastic_smirk':
        rightBrowY -= 14 + Math.sin(time * 3) * 2;
        rightBrowAngle = -0.22;
        leftBrowAngle = 0.08;
        leftLidDrop = 0.45;
        pupilOffsetX = 4;
        pupilOffsetY = -6;
        break;

      case 'annoyed_frown':
        isEyeRolling = true;
        leftLidDrop = 0.35;
        rightLidDrop = 0.35;
        pupilOffsetY = -12;
        leftBrowAngle = -0.15;
        rightBrowAngle = 0.15;
        break;

      case 'loving_hearts':
        isHeartEyes = true;
        leftBrowY += 3;
        rightBrowY += 3;
        leftBrowAngle = 0.1;
        rightBrowAngle = -0.1;
        pupilOffsetX = Math.sin(time * 4) * 3;
        pupilOffsetY = Math.cos(time * 3) * 2;
        break;

      case 'evil_schemer':
        isVillainGlance = true;
        leftBrowY += 8;
        rightBrowY += 8;
        leftBrowAngle = 0.38;
        rightBrowAngle = -0.38;
        leftLidDrop = 0.3;
        rightLidDrop = 0.3;
        pupilOffsetY = 4;
        break;

      case 'thinking_scan':
        pupilOffsetX = Math.sin(time * 6) * 12;
        pupilOffsetY = -3;
        rightBrowY -= 5;
        break;

      case 'happy_smile':
        leftBrowY -= 6;
        rightBrowY -= 6;
        break;

      case 'laughing':
        isSquintLaugh = true;
        break;

      case 'neutral_wave':
      default:
        pupilOffsetX += Math.sin(time * 1.5) * 3;
        pupilOffsetY += Math.cos(time * 1.2) * 2;
        break;
    }

    const renderSingleEye = (
      cx: number,
      cy: number,
      isRight: boolean,
      lidDrop: number
    ) => {
      ctx.save();

      if (isSquintLaugh || (startle > 0.4 && startle < 0.8)) {
        // Laughing or winced shut in startle
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = colors.primary;
        ctx.moveTo(cx - 24, cy + 6);
        ctx.quadraticCurveTo(cx, cy - 14, cx + 24, cy + 6);
        ctx.stroke();

        const lashDir = isRight ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx + 22 * lashDir, cy + 2);
        ctx.lineTo(cx + 34 * lashDir, cy - 8);
        ctx.moveTo(cx + 16 * lashDir, cy - 4);
        ctx.lineTo(cx + 26 * lashDir, cy - 16);
        ctx.moveTo(cx + 6 * lashDir, cy - 10);
        ctx.lineTo(cx + 12 * lashDir, cy - 24);
        ctx.stroke();

        ctx.restore();
        return;
      }

      // Eye contour
      const w = eyeWidth;
      const h = eyeHeight * (1 - lidDrop);
      const r = 12;

      ctx.beginPath();
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 3.5;
      ctx.roundRect(cx - w / 2, cy - h / 2 + (eyeHeight * lidDrop) / 2, w, h, r);
      ctx.stroke();

      ctx.fillStyle = colors.dim;
      ctx.fill();

      // Signature Karen eyelashes
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors.primary;
      const side = isRight ? 1 : -1;
      const topCornerX = cx + (w / 2 - 4) * side;
      const topCornerY = cy - eyeHeight / 2 - 2;

      ctx.moveTo(topCornerX, topCornerY + 6);
      ctx.lineTo(topCornerX + 16 * side, topCornerY - 6);
      ctx.moveTo(topCornerX - 6 * side, topCornerY + 1);
      ctx.lineTo(topCornerX + 8 * side, topCornerY - 14);
      ctx.moveTo(topCornerX - 14 * side, topCornerY - 2);
      ctx.lineTo(topCornerX - 4 * side, topCornerY - 18);
      ctx.stroke();

      // Eye Pupil
      if (blinkOpen > 0.25) {
        if (isHeartEyes) {
          drawPixelHeart(ctx, cx + pupilOffsetX, cy + pupilOffsetY, 1.1, colors);
        } else {
          const pSize = isVillainGlance ? 11 : 15;
          const px = cx + pupilOffsetX;
          const py = cy + pupilOffsetY + (isEyeRolling ? -6 : 0);

          ctx.fillStyle = colors.primary;
          ctx.beginPath();
          ctx.roundRect(px - pSize / 2, py - pSize / 2, pSize, pSize, 3);
          ctx.fill();

          ctx.fillStyle = colors.whiteGlow;
          ctx.fillRect(px - pSize / 2 + 2, py - pSize / 2 + 2, 4, 4);
        }
      }

      ctx.restore();
    };

    renderSingleEye(leftEyeX, baseY, false, leftLidDrop);
    renderSingleEye(rightEyeX, baseY, true, rightLidDrop);

    // Eyebrows
    const drawEyebrow = (
      cx: number,
      cy: number,
      angle: number,
      isRight: boolean
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = colors.primary;
      const bw = 26;
      ctx.moveTo(-bw, 0);
      ctx.lineTo(bw, 0);
      ctx.stroke();
      ctx.restore();
    };

    drawEyebrow(leftEyeX, leftBrowY, leftBrowAngle, false);
    drawEyebrow(rightEyeX, rightBrowY, rightBrowAngle, true);

    // Blushing pixel cheeks
    if (currentEmotion === 'loving_hearts' || currentEmotion === 'happy_smile') {
      ctx.fillStyle = colors.highlight;
      const blushBounce = Math.sin(time * 5) * 1.5;
      ctx.fillRect(leftEyeX - 15, baseY + 32 + blushBounce, 22, 5);
      ctx.fillRect(rightEyeX - 7, baseY + 32 + blushBounce, 22, 5);
    }
  };

  /**
   * Helper to draw a crisp retro pixel heart
   */
  const drawPixelHeart = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number,
    colors: any
  ) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = colors.primary;
    const p = 3.5 * scale;
    const matrix = [
      [0, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ];
    matrix.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val) {
          ctx.fillRect((c - 3) * p, (r - 3) * p, p - 0.5, p - 0.5);
        }
      });
    });
    ctx.restore();
  };

  /**
   * KAREN'S OSCILLOSCOPE MOUTH WAVE
   */
  const drawKarenOscilloscopeMouth = (
    ctx: CanvasRenderingContext2D,
    width: number,
    centerY: number,
    time: number,
    currentEmotion: EmotionType,
    vocalPulse: number,
    isSpeaking: boolean,
    startle: number,
    colors: any
  ) => {
    ctx.beginPath();
    const segments = 90;
    const step = width / segments;

    for (let i = 0; i <= segments; i++) {
      const x = i * step;
      const normalized = (i - segments / 2) / (segments / 2);
      const envelope = Math.max(0, 1 - normalized * normalized);

      let wave =
        Math.sin(i * 0.4 + time * 7) * 0.6 +
        Math.sin(i * 0.85 - time * 11) * 0.35 +
        Math.cos(i * 0.2 + time * 4) * 0.25;

      let amplitude = (isSpeaking ? 38 * vocalPulse : 3.5) * envelope;
      let shapeOffset = 0;

      // Poke startle creates electric jitter spike
      if (startle > 0.1) {
        amplitude += Math.sin(i * 2 + time * 25) * (startle * 22) * envelope;
      }

      switch (currentEmotion) {
        case 'happy_smile':
        case 'laughing':
          shapeOffset = -Math.sin(envelope * Math.PI) * 22;
          if (currentEmotion === 'laughing') {
            amplitude += Math.abs(Math.sin(time * 15)) * 14 * envelope;
          }
          break;

        case 'annoyed_frown':
          shapeOffset = Math.sin(envelope * Math.PI) * 18;
          break;

        case 'sarcastic_smirk':
          shapeOffset = -normalized * 16 * envelope;
          break;

        case 'evil_schemer':
          wave = (i % 2 === 0 ? 1 : -1) * 0.8 + Math.sin(i * 0.5) * 0.4;
          amplitude = (16 + vocalPulse * 24) * envelope;
          break;

        case 'loving_hearts': {
          const distFromCenter = Math.abs(i - segments / 2);
          if (distFromCenter < 5) {
            const beat = Math.sin(time * 6) > 0.6 ? 25 : 0;
            if (distFromCenter === 2) shapeOffset = -30 - beat;
            else if (distFromCenter === 0) shapeOffset = 35 + beat;
          }
          break;
        }

        case 'thinking_scan':
          wave = Math.sin(i * (0.2 + Math.sin(time * 2) * 0.15) + time * 12);
          break;

        case 'neutral_wave':
        default:
          break;
      }

      const speechJitter = isSpeaking || startle > 0.2 ? (Math.random() - 0.5) * 6 : 0;
      const y = centerY + shapeOffset + wave * amplitude + speechJitter;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Trailing phosphor echo line
    ctx.beginPath();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = colors.highlight;
    for (let i = 0; i <= segments; i++) {
      const x = i * step;
      const normalized = (i - segments / 2) / (segments / 2);
      const envelope = Math.max(0, 1 - normalized * normalized);
      let shapeOffset = 0;
      if (currentEmotion === 'happy_smile' || currentEmotion === 'laughing') {
        shapeOffset = -Math.sin(envelope * Math.PI) * 20;
      } else if (currentEmotion === 'annoyed_frown') {
        shapeOffset = Math.sin(envelope * Math.PI) * 16;
      }
      const y =
        centerY +
        shapeOffset +
        Math.sin(i * 0.4 + time * 7) * (isSpeaking ? 24 * vocalPulse : 2) * envelope;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleScreenClick}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black cursor-pointer select-none active:scale-[0.995] transition-transform"
      title="Click/tap screen to poke Karen!"
    >
      {/* CRT Curvature and Screen Canvas */}
      <canvas
        ref={canvasRef}
        width={640}
        height={380}
        className="w-full h-full object-contain crt-flicker"
      />

      {/* Floating Poke reaction bubble tag */}
      {pokeTip && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500/90 text-black font-pixel text-[10px] rounded shadow-lg pointer-events-none animate-bounce">
          {pokeTip}
        </div>
      )}

      {/* Scanline and Glass Curvature Overlay */}
      <div className="absolute inset-0 crt-screen-overlay pointer-events-none" />
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      {/* Subtle CRT glass glare reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};
