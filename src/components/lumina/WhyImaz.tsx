"use client";

import { Shield, Users, Zap, Heart } from "lucide-react";
import { useStatCounter, useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

/* ── Stat counter sub-component (same pattern as Hero) ── */
function StatCounter({
  target,
  isDecimal = false,
  suffix = "",
}: {
  target: number;
  isDecimal?: boolean;
  suffix?: string;
}) {
  const ref = useStatCounter(target, isDecimal);
  return (
    <span ref={ref} className="stat-num inline-block">
      0
    </span>
  );
}

/* ── Feature card sub-component ── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className={`stagger bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 hover:bg-white/10 hover:border-teal-400/30 transition-all duration-300 group`}
      style={{ transitionDelay: delay }}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-bold text-white text-[14px] mb-1">{title}</h4>
      <p className="text-[13px] text-white/50 leading-[1.8]">{description}</p>
    </div>
  );
}

/* ── Main component ── */
export default function WhyImaz() {
  const sectionRef = useScrollReveal();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const stats = [
    { value: 10, suffix: "+", labelKey: "whyimaz.stat_years", isDecimal: false },
    { value: 8000, suffix: "+", labelKey: "whyimaz.stat_patients", isDecimal: false },
    { value: 6, suffix: "+", labelKey: "whyimaz.stat_services", isDecimal: false },
    { value: 99, suffix: "%", labelKey: "whyimaz.stat_success", isDecimal: false },
  ];

  const features = [
    {
      icon: Shield,
      titleKey: "whyimaz.feat1_title",
      descKey: "whyimaz.feat1_desc",
    },
    {
      icon: Users,
      titleKey: "whyimaz.feat2_title",
      descKey: "whyimaz.feat2_desc",
    },
    {
      icon: Zap,
      titleKey: "whyimaz.feat3_title",
      descKey: "whyimaz.feat3_desc",
    },
    {
      icon: Heart,
      titleKey: "whyimaz.feat4_title",
      descKey: "whyimaz.feat4_desc",
    },
  ];

  return (
    <section
      id="whyimaz"
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden min-h-[calc(100dvh-80px)] flex flex-col justify-center"
      style={{
        background:
          "linear-gradient(135deg, rgba(13,58,53,0.92) 0%, rgba(26,35,50,0.88) 45%, rgba(17,78,71,0.90) 100%), url('/images/hero-bg-abstract.png') center/cover no-repeat",
      }}
    >
      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          opacity: 0.04,
          backgroundImage:
            "radial-gradient(circle, #6BCDB8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Background blur blobs */}
      <div
        className="absolute top-1/4 -start-20 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "#1B7A6E" }}
      />
      <div
        className="absolute bottom-1/4 -end-20 w-96 h-96 rounded-full opacity-8 blur-3xl"
        style={{ background: "#2DA89E" }}
      />

      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        {/* Section heading */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          {/* Label with teal accent lines */}
          <div className="reveal flex items-center justify-center gap-3 mb-4">
            <span
              className={`w-10 sm:w-14 h-[2px] rounded-full ${
                isRTL
                  ? "bg-gradient-to-l"
                  : "bg-gradient-to-r"
              } from-transparent to-teal-400`}
            />
            <span className="text-teal-300 font-semibold text-[12px] tracking-[0.2em] uppercase">
              {t("whyimaz.label")}
            </span>
            <span
              className={`w-10 sm:w-14 h-[2px] rounded-full ${
                isRTL
                  ? "bg-gradient-to-r"
                  : "bg-gradient-to-l"
              } from-transparent to-teal-400`}
            />
          </div>

          {/* Heading */}
          <h2 className="reveal d1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.15] text-white">
            {t("whyimaz.heading").split(" ").map((word, i, arr) => {
              // Highlight the last two words (or key phrase) in teal-300
              const highlightIndex = Math.max(0, arr.length - 2);
              return (
                <span key={i}>
                  {i === highlightIndex ? (
                    <span className="text-teal-300">
                      {arr.slice(highlightIndex).join(" ")}
                    </span>
                  ) : i < highlightIndex ? (
                    <>{word} </>
                  ) : null}
                </span>
              );
            })}
          </h2>
        </div>

        {/* Stat counters */}
        <div className="reveal d2 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8 sm:mb-10 lg:mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-300 mb-1">
                <StatCounter
                  target={stat.value}
                  isDecimal={stat.isDecimal}
                  suffix={stat.suffix}
                />
                <span className="text-teal-300">{stat.suffix}</span>
              </div>
              <div className="text-sm text-teal-200/60 font-medium">
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>

        {/* Divider line */}
        <div className="reveal d3 flex justify-center mb-8 sm:mb-10 lg:mb-12">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descKey)}
              delay={`${index * 80}ms`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
