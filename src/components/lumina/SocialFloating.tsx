"use client";

import { useEffect, useState } from "react";
import { Send, MessageCircle, Youtube, Instagram } from "lucide-react";
import { BaleIcon } from "@/components/icons/BaleIcon";
import { useI18n } from "@/i18n/context";

interface SocialLink {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
  labelFa: string;
  href: string;
  color: string;
  hoverBg: string;
  settingKey: string;
}

const socialLinks: SocialLink[] = [
  {
    Icon: Send,
    labelFa: "تلگرام",
    href: "https://t.me/imazdental",
    color: "#2AABEE",
    hoverBg: "rgba(42, 171, 238, 0.15)",
    settingKey: "social_telegram",
  },
  {
    Icon: MessageCircle,
    labelFa: "واتساپ",
    href: "https://wa.me/989191190995",
    color: "#25D366",
    hoverBg: "rgba(37, 211, 102, 0.15)",
    settingKey: "social_whatsapp",
  },
  {
    Icon: BaleIcon,
    labelFa: "بله",
    href: "https://ble.ir/imazdental",
    color: "#00BFA5",
    hoverBg: "rgba(0, 191, 165, 0.15)",
    settingKey: "social_bale",
  },
  {
    Icon: Youtube,
    labelFa: "یوتیوب",
    href: "https://youtube.com/@imazdental",
    color: "#FF0000",
    hoverBg: "rgba(255, 0, 0, 0.12)",
    settingKey: "social_youtube",
  },
  {
    Icon: Instagram,
    labelFa: "اینستاگرام",
    href: "https://instagram.com/imazdental",
    color: "#E4405F",
    hoverBg: "rgba(228, 64, 95, 0.15)",
    settingKey: "social_instagram",
  },
];

export default function SocialFloating() {
  const { dir } = useI18n();
  const isRTL = dir === "rtl";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [links, setLinks] = useState<SocialLink[]>(socialLinks);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) return;
        const data = await res.json();
        const s = data.settings || {};

        if (cancelled) return;

        setLinks(
          socialLinks.map((link) => {
            const rawHref = s[link.settingKey] || link.href;
            const href = /^https?:\/\//i.test(rawHref) ? rawHref : `https://${rawHref}`;
            return { ...link, href };
          })
        );
      } catch {
        // Use defaults on error.
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`fixed z-50 flex flex-col items-center gap-3 top-1/2 -translate-y-1/2 ${
        isRTL ? "right-0" : "left-0"
      }`}
    >
      {links.map((link, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <a
            key={link.labelFa}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={link.labelFa}
          >
            <div
              className={`absolute whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-white/95 shadow-lg border border-teal-500/10 text-[#1A2332]
                transition-all duration-300 pointer-events-none
                ${isRTL ? "right-full mr-3" : "left-full ml-3"}
                ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : isRTL
                      ? "opacity-0 translate-x-2"
                      : "opacity-0 -translate-x-2"
                }
              `}
            >
              {link.labelFa}
            </div>

            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center
                transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                ${isRTL ? "rounded-r-none sm:rounded-r-none" : "rounded-l-none sm:rounded-l-none"}
                ${isRTL ? "rounded-r-lg" : "rounded-l-lg"}
              `}
              style={{
                background: isHovered ? link.hoverBg : "rgba(255,255,255,0.90)",
                boxShadow: isHovered
                  ? `0 0 16px ${link.color}40, 0 4px 12px rgba(0,0,0,0.08)`
                  : "0 2px 8px rgba(0,0,0,0.08)",
                transform: isHovered ? "scale(1.12)" : "scale(1)",
                borderRight: isRTL ? `2px solid ${link.color}40` : undefined,
                borderLeft: !isRTL ? `2px solid ${link.color}40` : undefined,
              }}
            >
              <link.Icon
                className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300"
                style={{ color: isHovered ? link.color : "#1B7A6E" }}
              />
            </div>
          </a>
        );
      })}
    </div>
  );
}
