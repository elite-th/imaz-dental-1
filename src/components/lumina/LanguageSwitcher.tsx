"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { LOCALES, type Locale } from "@/i18n/types";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [dropH, setDropH] = useState<"down" | "up">("down");
  const [dropX, setDropX] = useState<"start" | "end">("end");
  const ref = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [closeMenu]);

  /* When opening, detect viewport overflow and flip direction */
  const handleToggle = useCallback(() => {
    if (open) {
      closeMenu();
      return;
    }

    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const isRtl = document.documentElement.dir === "rtl";

      // Horizontal: in RTL default is "start" (open left), in LTR "end" (open right)
      const spaceEnd = isRtl ? rect.right : window.innerWidth - rect.right;
      const spaceStart = isRtl ? window.innerWidth - rect.left : rect.left;
      const dropWidth = 170;
      setDropX(spaceEnd < dropWidth && spaceStart >= dropWidth ? (isRtl ? "end" : "start") : (isRtl ? "start" : "end"));

      // Vertical: flip upward if not enough space below
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropHeight = 180;
      setDropH(spaceBelow < dropHeight && spaceAbove >= dropHeight ? "up" : "down");
    }

    setOpen(true);
    setClosing(false);
  }, [open, closeMenu]);

  const handleSelect = useCallback(
    (code: Locale) => {
      setLocale(code);
      closeMenu();
    },
    [setLocale, closeMenu]
  );

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[13px] font-medium text-charcoal-400 hover:text-charcoal-800 transition-colors min-h-[36px]"
        aria-label={t("header.switch_lang")}
        aria-expanded={open}
      >
        <Globe className="w-[18px] h-[18px]" />
        <span>{current.label}</span>
      </button>

      {open && (
        <div
          className={`absolute bg-white rounded-xl shadow-xl border border-teal-200/30 py-1.5 min-w-[160px] z-10 ${
            dropH === "down" ? "top-full mt-2" : "bottom-full mb-2"
          } ${
            dropX === "end" ? "end-0" : "start-0"
          } ${
            closing
              ? "animate-out fade-out-0 zoom-out-95 duration-150"
              : "animate-in fade-in-0 zoom-in-95 duration-150"
          }`}
        >
          {LOCALES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors ${
                locale === l.code
                  ? "bg-teal-50 text-teal-700 font-semibold"
                  : "text-charcoal-400 hover:bg-teal-50 hover:text-charcoal-800"
              }`}
            >
              <span className="text-base">{l.label}</span>
              {locale === l.code && (
                <span className="ms-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
