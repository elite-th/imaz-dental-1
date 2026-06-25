"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

interface PricingTier {
  name: string;
  desc: string;
  price: string;
  annualPrice: string;
  unit: string;
  features: string[];
  featured: boolean;
  badge?: string;
  cta: string;
}

export default function Pricing() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const sectionRef = useScrollReveal();
  const [isAnnual, setIsAnnual] = useState(false);

  const tiers: PricingTier[] = [
    {
      name: t("pricing.basic_name"),
      desc: t("pricing.basic_desc"),
      price: t("pricing.basic_price"),
      annualPrice: "۴۲۵,۰۰۰",
      unit: t("pricing.basic_unit"),
      features: [
        t("pricing.basic_f1"),
        t("pricing.basic_f2"),
        t("pricing.basic_f3"),
        t("pricing.basic_f4"),
      ],
      featured: false,
      cta: t("pricing.cta"),
    },
    {
      name: t("pricing.premium_name"),
      desc: t("pricing.premium_desc"),
      price: t("pricing.premium_price"),
      annualPrice: "۲,۱۲۵,۰۰۰",
      unit: t("pricing.premium_unit"),
      features: [
        t("pricing.premium_f1"),
        t("pricing.premium_f2"),
        t("pricing.premium_f3"),
        t("pricing.premium_f4"),
        t("pricing.premium_f5"),
      ],
      featured: true,
      badge: t("pricing.premium_badge"),
      cta: t("pricing.cta_featured"),
    },
    {
      name: t("pricing.vip_name"),
      desc: t("pricing.vip_desc"),
      price: t("pricing.vip_price"),
      annualPrice: "از ۱۲,۷۵۰,۰۰۰",
      unit: t("pricing.vip_unit"),
      features: [
        t("pricing.vip_f1"),
        t("pricing.vip_f2"),
        t("pricing.vip_f3"),
        t("pricing.vip_f4"),
        t("pricing.vip_f5"),
      ],
      featured: false,
      cta: t("pricing.cta"),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "#FAFCFB" }}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#1B7A6E 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative teal gradient blur blob */}
      <div
        className="absolute top-20 start-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "rgba(27,122,110,0.04)" }}
      />
      <div
        className="absolute bottom-20 end-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "rgba(107,205,184,0.04)" }}
      />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-700 font-semibold text-[12px] mb-5">
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
            {t("pricing.label")}
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
          </span>
          <h2 className="reveal d1 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A2332] leading-[1.15]">
            {t("pricing.heading")}
          </h2>
          <p className="reveal mt-4 text-[#1A2332]/55 text-sm sm:text-[15px] leading-relaxed max-w-lg mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* Price Period Toggle */}
        <div className="reveal flex items-center justify-center gap-4 mb-12">
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              !isAnnual ? "text-teal-700" : "text-[#1A2332]/40"
            }`}
          >
            {t("pricing.monthly")}
          </span>
          {/* Toggle switch */}
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:ring-offset-2"
            style={{
              background: isAnnual
                ? "linear-gradient(135deg, #1B7A6E, #2DA89E)"
                : "rgba(27,122,110,0.15)",
            }}
            aria-label="Toggle annual pricing"
          >
            {/* Sliding knob */}
            <span
              className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                insetInlineStart: isAnnual ? "calc(100% - 26px)" : "2px",
              }}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${
              isAnnual ? "text-teal-700" : "text-[#1A2332]/40"
            }`}
          >
            {t("pricing.annual")}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E8637C]/10 text-[#E8637C] text-[10px] font-bold">
              {t("pricing.save_percent")}
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="stagger grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative rounded-2xl transition-all duration-500 group ${
                tier.featured
                  ? "md:-mt-4 md:mb-0 md:scale-[1.04] z-10"
                  : "hover:-translate-y-2"
              }`}
            >
              {/* Featured card: teal gradient background with ribbon */}
              {tier.featured ? (
                <div className="relative rounded-2xl overflow-hidden p-7 sm:p-8 lg:p-10">
                  {/* Teal gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1B7A6E] via-[#1A8F80] to-[#2DA89E]" />

                  {/* Decorative dot pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.06]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle,white 1px,transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Coral accent stripe at top */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#E8637C] to-[#F09] rounded-t-2xl" />

                  {/* "Most Popular" diagonal ribbon — top right corner */}
                  <div
                    className="absolute -top-0 -end-0 w-24 h-24 overflow-hidden pointer-events-none"
                    aria-hidden="true"
                  >
                    <div
                      className="absolute top-5 end-[-30px] w-[130px] text-center py-1.5 text-[10px] font-bold text-white tracking-wide"
                      style={{
                        background: "#E8637C",
                        transform: "rotate(45deg)",
                        boxShadow: "0 2px 8px rgba(232,99,124,0.3)",
                      }}
                    >
                      {tier.badge}
                    </div>
                  </div>

                  {/* Sparkle decoration near featured card */}
                  <div className="absolute top-4 start-4 pointer-events-none opacity-30">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>

                  {/* Popular badge */}
                  <div className="relative flex justify-center mb-6">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 text-white text-[11px] font-bold tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8637C] animate-pulse" />
                      {tier.badge}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="relative text-center">
                    <h3 className="text-white font-bold text-lg sm:text-xl mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-white/65 text-sm mb-6">{tier.desc}</p>

                    {/* Price with animation */}
                    <div className="mb-8">
                      <span
                        className="text-white font-display text-4xl sm:text-5xl font-extrabold transition-all duration-500 inline-block"
                        style={{
                          transform: isAnnual ? "scale(1)" : "scale(1)",
                          opacity: 1,
                        }}
                      >
                        {isAnnual ? tier.annualPrice : tier.price}
                      </span>
                      <span className="text-white/60 text-sm font-medium block mt-1">
                        {tier.unit}
                      </span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3.5 mb-8 text-start">
                      {tier.features.map((feature, fi) => (
                        <div key={fi} className="flex items-start gap-3">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-[#6BCDB8]" />
                          </span>
                          <span className="text-white/85 text-sm leading-relaxed">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <a
                      href="#booking"
                      className="btn-cta inline-flex items-center justify-center gap-2.5 w-full px-8 py-4 rounded-xl text-white font-bold text-[14px] shadow-xl shadow-teal-900/30"
                    >
                      {tier.cta}
                    </a>
                  </div>
                </div>
              ) : (
                /* Non-featured cards: white bg with glassmorphism on hover */
                <div
                  className={`relative rounded-2xl bg-white border border-teal-500/10 p-7 sm:p-8 lg:p-10 transition-all duration-500 hover:translate-y-[-8px] hover:border-teal-400/30 hover:shadow-layered hover:backdrop-blur-sm ${
                    index === 0 ? "md:rounded-r-none md:rounded-2xl" : ""
                  } ${index === 2 ? "md:rounded-l-none md:rounded-2xl" : ""}`}
                >
                  {/* Glassmorphism glow on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(27,122,110,0.03), rgba(107,205,184,0.02))",
                    }}
                  />

                  {/* Tier name & description */}
                  <div className="relative text-center mb-6">
                    <h3 className="text-[#1A2332] font-bold text-lg sm:text-xl mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-[#1A2332]/50 text-sm">{tier.desc}</p>
                  </div>

                  {/* Price with animation */}
                  <div className="relative text-center mb-8">
                    <span
                      className="text-[#1B7A6E] font-display text-4xl sm:text-5xl font-extrabold transition-all duration-500 inline-block"
                    >
                      {isAnnual ? tier.annualPrice : tier.price}
                    </span>
                    <span className="text-[#1A2332]/40 text-sm font-medium block mt-1">
                      {tier.unit}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-teal-500/15 to-transparent mb-8" />

                  {/* Features */}
                  <div className="relative space-y-3.5 mb-8">
                    {tier.features.map((feature, fi) => (
                      <div key={fi} className="flex items-start gap-3">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-teal-600" />
                        </span>
                        <span className="text-[#1A2332]/70 text-sm leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button — teal outline style */}
                  <a
                    href="#booking"
                    className="inline-flex items-center justify-center gap-2.5 w-full px-8 py-3.5 rounded-xl border-2 border-teal-500/25 text-teal-700 font-bold text-[13px] transition-all duration-300 hover:bg-teal-500 hover:text-white hover:border-teal-500 hover:shadow-lg hover:shadow-teal-500/20"
                  >
                    {tier.cta}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="reveal text-center mt-10 text-[#1A2332]/40 text-[12px] sm:text-[13px]">
          {t("pricing.note")}
        </p>
      </div>
    </section>
  );
}
