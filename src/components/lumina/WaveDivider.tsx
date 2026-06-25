"use client";

import { useRef, useEffect, useCallback } from "react";

/* ── Wave Divider ──
   Renders an SVG wave or canvas-based water animation that transitions
   smoothly from one section's background colour to the next.          */

interface WaveDividerProps {
  /** Section colour we are transitioning FROM */
  fromColor: string;
  /** Section colour we are transitioning TO */
  toColor: string;
  /** Wave shape variation */
  variant?: 1 | 2 | 3 | 4 | 5;
  /** Mirror the wave horizontally */
  flip?: boolean;
  /** Optional accent color for decorative elements */
  accentColor?: string;
}

/* Cubic‑bezier wave paths — designed on a 1440 × 80 viewBox */
const WAVE_PATHS: Record<number, string> = {
  1: "M0,0 L0,36 C240,72 480,72 720,36 C960,0 1200,0 1440,36 L1440,0 Z",
  2: "M0,0 L0,28 C180,64 360,64 540,28 C720,-8 900,-8 1080,28 C1200,52 1320,52 1440,28 L1440,0 Z",
  3: "M0,0 L0,40 C160,68 400,76 640,40 C880,4 1100,56 1440,24 L1440,0 Z",
  4: "M0,0 L0,30 C120,60 280,68 440,38 C600,8 720,8 880,38 C1040,68 1200,60 1440,30 L1440,0 Z",
};

/* ── Variant 5: Canvas Water Animation ── */
function WaterWaveCanvas({
  fromColor,
  toColor,
  accentColor,
}: {
  fromColor: string;
  toColor: string;
  accentColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const accent = accentColor || "#6BCDB8";

  /* Parse hex to rgb for canvas gradient usage */
  const hexToRgb = useCallback((hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 27, g: 122, b: 110 };
  }, []);

  /* Wave layers — adapted from the user's reference but in teal/clinic palette */
  const waves = useCallback(() => {
    const rgb = hexToRgb(accent);
    return [
      {
        yOffset: 0.18,
        length: 0.003,
        amplitude: 16,
        speed: 0.010,
        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10)`,
      },
      {
        yOffset: 0.30,
        length: 0.004,
        amplitude: 20,
        speed: 0.014,
        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
      },
      {
        yOffset: 0.45,
        length: 0.005,
        amplitude: 24,
        speed: 0.018,
        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`,
      },
      {
        yOffset: 0.60,
        length: 0.006,
        amplitude: 18,
        speed: 0.012,
        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
      },
      {
        yOffset: 0.78,
        length: 0.007,
        amplitude: 10,
        speed: 0.022,
        color: toColor,
      },
    ];
  }, [accent, hexToRgb, toColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width: number, height: number;

    function resize() {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx!.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    }

    resize();
    window.addEventListener("resize", resize);

    const waveLayers = waves();

    function animate() {
      if (!canvas || !ctx) return;
      const displayWidth = canvas.offsetWidth;
      const displayHeight = canvas.offsetHeight;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      /* Fill the top part with fromColor */
      const fromRgb = hexToRgb(fromColor);
      ctx.fillStyle = `rgb(${fromRgb.r}, ${fromRgb.g}, ${fromRgb.b})`;
      ctx.fillRect(0, 0, displayWidth, displayHeight * 0.5);

      /* Draw each wave layer */
      waveLayers.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, displayHeight);

        const baseY = displayHeight * wave.yOffset;

        for (let x = 0; x <= displayWidth; x += 2) {
          const currentAmplitude =
            wave.amplitude * Math.sin(timeRef.current * 0.005 + index);
          const y =
            baseY +
            Math.sin(x * wave.length + timeRef.current * wave.speed) *
              currentAmplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(displayWidth, displayHeight);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      timeRef.current++;
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [fromColor, hexToRgb, waves]);

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ height: "80px" }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default function WaveDivider({
  fromColor,
  toColor,
  variant = 1,
  flip = false,
  accentColor,
}: WaveDividerProps) {
  /* Variant 5: Canvas water wave animation */
  if (variant === 5) {
    return (
      <WaterWaveCanvas
        fromColor={fromColor}
        toColor={toColor}
        accentColor={accentColor}
      />
    );
  }

  /* Variant 4: Ornate luxury divider */
  if (variant === 4) {
    const accent = accentColor || "#2DA89E";
    return (
      <div
        className="w-full relative overflow-hidden"
        style={{ background: toColor }}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="block w-full"
          style={{
            height: "60px",
            transform: flip ? "scaleX(-1)" : undefined,
          }}
        >
          <defs>
            <linearGradient id="luxury-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={accent} stopOpacity="0" />
              <stop offset="30%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="50%" stopColor={accent} stopOpacity="0.5" />
              <stop offset="70%" stopColor={accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L0,38 C180,72 360,76 540,42 C720,8 900,4 1080,38 C1200,60 1320,68 1440,42 L1440,0 Z"
            fill={fromColor}
            opacity="0.5"
          />
          <path d={WAVE_PATHS[4]} fill={fromColor} />
          <path
            d="M0,34 C180,64 360,68 540,38 C720,8 900,8 1080,38 C1200,58 1320,62 1440,34"
            fill="none"
            stroke="url(#luxury-grad)"
            strokeWidth="1.5"
          />
        </svg>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-3">
            <div
              className="w-20 sm:w-40 h-px"
              style={{
                background: `linear-gradient(to right, transparent, ${accent}40)`,
              }}
            />
            <div
              className="w-2.5 h-2.5 rotate-45 rounded-[2px]"
              style={{ background: accent, opacity: 0.5 }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent, opacity: 0.7 }}
            />
            <div
              className="w-2.5 h-2.5 rotate-45 rounded-[2px]"
              style={{ background: accent, opacity: 0.5 }}
            />
            <div
              className="w-20 sm:w-40 h-px"
              style={{
                background: `linear-gradient(to left, transparent, ${accent}40)`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* Default variants 1-3 */
  const path = WAVE_PATHS[variant] || WAVE_PATHS[1];
  return (
    <div
      className="w-full leading-[0] relative"
      style={{ background: toColor }}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block w-full"
        style={{
          height: "50px",
          transform: flip ? "scaleX(-1)" : undefined,
        }}
      >
        <path d={path} fill={fromColor} />
      </svg>
    </div>
  );
}
