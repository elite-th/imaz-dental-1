"use client";

import { useEffect, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { scrollToElement } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

export default function MobileStickyCta() {
  const [show, setShow] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const bookingSection = document.querySelector("#booking");
    if (!bookingSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (window.scrollY < 400) {
            setShow(false);
          } else {
            setShow(!entry.isIntersecting);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    observer.observe(bookingSection);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`mobile-sticky-cta lg:hidden fixed bottom-0 left-0 right-0 z-40 ${
        show ? "show" : ""
      }`}
    >
      <div className="bg-white/95 border-t border-teal-200/60 px-4 py-3">
        <button
          className="btn-cta w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-white font-bold text-[13px] shadow-lg shadow-teal-500/20"
          onClick={() => scrollToElement("#booking")}
        >
          <CalendarCheck className="w-4 h-4" />
          {t("mobileCta.book")}
        </button>
      </div>
    </div>
  );
}
