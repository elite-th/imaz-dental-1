"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, X } from "lucide-react";
import { BaleIcon } from "@/components/icons/BaleIcon";
import { useI18n } from "@/i18n/context";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isOpen]);

  const contactOptions = [
    {
      Icon: MessageCircle,
      label: t("floating.whatsapp"),
      href: "https://wa.me/982188776655",
      color: "#25D366",
      bg: "rgba(37, 211, 102, 0.10)",
      border: "rgba(37, 211, 102, 0.20)",
    },
    {
      Icon: BaleIcon,
      label: t("floating.bale"),
      href: "https://ble.ir/imazdental",
      color: "#00BFA5",
      bg: "rgba(0, 191, 165, 0.10)",
      border: "rgba(0, 191, 165, 0.20)",
    },
    {
      Icon: Phone,
      label: t("floating.call"),
      href: "tel:+982188776655",
      color: "#1B7A6E",
      bg: "rgba(27, 122, 110, 0.10)",
      border: "rgba(27, 122, 110, 0.20)",
    },
  ];

  return (
    <div
      className={`fixed z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      } ${isRTL ? "left-5" : "right-5"} bottom-24`}
    >
      <div
        className={`mb-3 flex flex-col gap-2 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {contactOptions.map((option) => (
          <a
            key={option.label}
            href={option.href}
            target={option.href.startsWith("http") ? "_blank" : undefined}
            rel={option.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
            style={{
              background: option.bg.replace("0.10", "0.92"),
              border: `1px solid ${option.border}`,
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${option.color}15` }}
            >
              <option.Icon className="w-4 h-4" style={{ color: option.color }} />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: option.color }}>
              {option.label}
            </span>
          </a>
        ))}
      </div>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "rotate-0 scale-90" : "rotate-0 scale-100 hover:scale-110"
        }`}
        style={{
          background: isOpen
            ? "linear-gradient(135deg, #1A2332, #2C3A4D)"
            : "linear-gradient(135deg, #1B7A6E, #2DA89E)",
          boxShadow: isOpen
            ? "0 8px 24px rgba(26,35,50,0.25)"
            : "0 8px 32px rgba(27,122,110,0.30)",
        }}
        aria-label={isOpen ? t("floating.close") : t("floating.open")}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#E8637C] border-2 border-white" />
          </div>
        )}
      </button>

      {!isOpen && visible && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#1A2332] bg-white/95 shadow-lg border border-teal-500/10 transition-opacity duration-300 pointer-events-none ${
            isRTL ? "right-full me-3" : "left-full ms-3"
          }`}
        >
          {t("floating.tooltip")}
        </div>
      )}
    </div>
  );
}
