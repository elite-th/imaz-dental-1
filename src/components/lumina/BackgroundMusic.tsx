"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Music, Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/i18n/context";

export default function BackgroundMusic() {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  // Read saved volume once at mount (lazy initializer)
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0.3;
    try {
      const saved = localStorage.getItem("imaz-music-volume");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    } catch {}
    return 0.3;
  });

  // Initialize audio element ONCE — never recreate on volume change
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    // Use local file for reliability (no CDN issues, no CORS, no blocked domains)
    audio.src = "/audio/ambient.mp3";
    audio.volume = volume;
    audioRef.current = audio;

    // Check if user had music enabled before
    const wasEnabled = localStorage.getItem("imaz-music-enabled") === "true";
    if (wasEnabled) {
      // Try to auto-play (will likely be blocked by browser, but worth trying)
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked — user must click to start
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume on audio element when volume state changes (without re-creating audio)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      // Fade out
      const fadeInterval = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume = Math.max(0, audio.volume - 0.02);
        } else {
          audio.volume = 0;
          audio.pause();
          clearInterval(fadeInterval);
          setIsPlaying(false);
        }
      }, 30);
    } else {
      // Fade in
      audio.volume = 0;
      audio.play().then(() => {
        setIsPlaying(true);
        const targetVol = volume;
        const fadeInterval = setInterval(() => {
          if (audio.volume < targetVol - 0.02) {
            audio.volume = Math.min(targetVol, audio.volume + 0.02);
          } else {
            audio.volume = targetVol;
            clearInterval(fadeInterval);
          }
        }, 30);
      }).catch((err) => {
        // Autoplay blocked by browser
        console.warn("Audio play failed:", err);
        setIsPlaying(false);
      });
    }

    // Save preference
    localStorage.setItem("imaz-music-enabled", String(!isPlaying));
  }, [isPlaying, volume]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    localStorage.setItem("imaz-music-volume", String(newVolume));
  }, []);

  return (
    <div
      className="fixed bottom-8 start-8 z-40 flex items-end gap-2"
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      {/* Volume slider - appears on hover */}
      <div
        className={`transition-all duration-300 ${
          showVolume ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg shadow-teal-500/10 border border-teal-100/60 p-3 flex flex-col items-center gap-2">
          <span className="text-[9px] font-semibold text-teal-700 whitespace-nowrap">
            {t("music.label")}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1.5 accent-teal-500 cursor-pointer"
            dir="ltr"
            aria-label={t("music.label")}
          />
          <div className="flex items-center gap-1">
            {volume === 0 ? (
              <VolumeX className="w-3 h-3 text-teal-500" />
            ) : (
              <Volume2 className="w-3 h-3 text-teal-500" />
            )}
            <span className="text-[9px] text-teal-600 font-medium">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main toggle button */}
      <button
        onClick={togglePlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 relative ${
          isPlaying
            ? "bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-500/30"
            : "bg-white/95 backdrop-blur-sm border border-teal-100/60 shadow-teal-500/10"
        }`}
        aria-label={`${t("music.label")} - ${isPlaying ? t("music.on") : t("music.off")}`}
      >
        <Music
          className={`w-4.5 h-4.5 transition-colors duration-300 ${
            isPlaying ? "text-white" : "text-teal-600"
          }`}
        />
        {isPlaying && (
          <span className="absolute top-0 start-0 w-full h-full rounded-full animate-ping bg-teal-400/30" />
        )}
      </button>
    </div>
  );
}
