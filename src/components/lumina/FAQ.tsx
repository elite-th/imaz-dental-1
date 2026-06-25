"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

interface FAQItem {
  id?: number;
  question: string;
  answer: string;
  sort_order?: number;
}

/** Build fallback FAQ items from i18n translations */
function getFallbackFaqs(t: (key: string) => string): FAQItem[] {
  return [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
    { question: t("faq.q6"), answer: t("faq.a6") },
  ];
}

export default function FAQ() {
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";
  const sectionRef = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Data fetching state
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFaqs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/faq?lang=${locale}`);
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();

        if (!cancelled && data.faqs && data.faqs.length > 0) {
          setFaqItems(data.faqs);
        } else if (!cancelled) {
          // API returned empty array — fall back to i18n
          setFaqItems(getFallbackFaqs(t));
        }
      } catch {
        // API failed — fall back to i18n translations
        if (!cancelled) {
          setFaqItems(getFallbackFaqs(t));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFaqs();
    return () => { cancelled = true; };
  }, [locale, t]);

  const handleToggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden min-h-[calc(100dvh-80px)] flex flex-col justify-center"
      style={{ background: "#FAFCFB" }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#1B7A6E 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-700 font-semibold text-[12px] mb-3">
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL
                  ? "bg-gradient-to-l"
                  : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
            {t("faq.label")}
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL
                  ? "bg-gradient-to-l"
                  : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
          </span>
          <h2 className="reveal d1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold text-[#1A2332] leading-[1.15]">
            {t("faq.heading")}
          </h2>
        </div>

        {/* Accordion */}
        <div className="stagger flex flex-col gap-2">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-xl border bg-white border-teal-500/10 p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  {/* Number circle skeleton */}
                  <div className="shrink-0 w-7 h-7 rounded-full bg-teal-500/10 animate-pulse" />
                  {/* Question text skeleton */}
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-teal-500/10 rounded animate-pulse w-3/4" />
                  </div>
                  {/* Chevron skeleton */}
                  <div className="shrink-0 w-5 h-5 rounded bg-teal-500/10 animate-pulse" />
                </div>
                {/* Answer skeleton */}
                <div className="mt-3 ml-10 space-y-2">
                  <div className="h-3 bg-teal-500/5 rounded animate-pulse w-full" />
                  <div className="h-3 bg-teal-500/5 rounded animate-pulse w-5/6" />
                </div>
              </div>
            ))
          ) : (
            faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id ?? index}
                  className={`rounded-xl border transition-all duration-300 ${
                    isOpen
                      ? "bg-teal-500/5 border-teal-500/20"
                      : "bg-white border-teal-500/10 hover:border-teal-500/15"
                  }`}
                >
                  <button
                    onClick={() => handleToggle(index)}
                    className="w-full flex items-center gap-3 p-4 sm:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 rounded-xl"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    {/* Number circle */}
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${
                        isOpen
                          ? "bg-teal-500 text-white"
                          : "bg-teal-500/10 text-teal-600"
                      }`}
                    >
                      {index + 1}
                    </span>

                    {/* Question text */}
                    <span className="flex-1 font-semibold text-[#1A2332] text-[13px] sm:text-[14px] leading-relaxed">
                      {item.question}
                    </span>

                    {/* Chevron */}
                    <ChevronDown
                      className={`shrink-0 w-5 h-5 text-teal-500/60 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Answer with smooth height animation using CSS grid trick */}
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <div className={`${isRTL ? "mr-10" : "ml-10"}`}>
                          <p className="text-[#1A2332]/55 text-[13px] leading-[1.85]">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
