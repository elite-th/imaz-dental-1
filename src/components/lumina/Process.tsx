"use client";

import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";
import { CalendarCheck, Stethoscope, Sparkles } from "lucide-react";

export default function Process() {
  const sectionRef = useScrollReveal();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const steps = [
    {
      number: 1,
      title: t("process.step_1_title"),
      description: t("process.step_1_desc"),
      gradient: "from-teal-400 to-teal-600",
      shadow: "shadow-teal-500/25",
      pulseColor: "bg-teal-400",
      Icon: CalendarCheck,
      isLast: false,
    },
    {
      number: 2,
      title: t("process.step_2_title"),
      description: t("process.step_2_desc"),
      gradient: "from-teal-300 to-teal-500",
      shadow: "shadow-teal-500/25",
      pulseColor: "bg-teal-300",
      Icon: Stethoscope,
      isLast: false,
    },
    {
      number: 3,
      title: t("process.step_3_title"),
      description: t("process.step_3_desc"),
      gradient: "from-coral-400 to-coral-600",
      shadow: "shadow-coral-500/25",
      pulseColor: "bg-[#E8637C]",
      Icon: Sparkles,
      isLast: true,
      isCoral: true,
    },
  ];

  return (
    <section
      id="process"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1A2332 0%, #2C3A4D 50%, #1F2B3D 100%)" }}
    >
      {/* Dot pattern overlay — teal tinted */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle,#1B7A6E 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Teal blur blob */}
      <div className="absolute top-0 start-0 w-[500px] h-[500px] bg-teal-600/10 rounded-full -translate-x-1/2 -translate-y-1/2" />

      {/* Coral accent blur — bottom end */}
      <div className="absolute bottom-0 end-0 w-[400px] h-[400px] bg-[#E8637C]/[0.06] rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-300 font-semibold text-[12px] mb-5">
            <span className="w-8 h-[2px] bg-teal-400/60 rounded-full" />
            {t("process.label")}
            <span className="w-8 h-[2px] bg-teal-400/60 rounded-full" />
          </span>
          <h2 className="reveal d1 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.15] mb-5">
            {t("process.heading")}
          </h2>
          <p className="reveal d2 text-teal-200/55 text-lg leading-[1.8]">
            {t("process.subtitle")}
          </p>
        </div>

        {/* Desktop: Vertical Timeline + Alternating Cards */}
        <div className="hidden md:block relative stagger">
          {/* Vertical timeline line */}
          <div
            className="absolute top-0 bottom-0 w-[3px] z-0"
            style={{
              left: isRTL ? "auto" : "50%",
              right: isRTL ? "50%" : "auto",
              transform: "translateX(50%)",
              background: "repeating-linear-gradient(to bottom, #1B7A6E 0px, #1B7A6E 8px, transparent 8px, transparent 16px)",
              opacity: 0.3,
            }}
          />

          {/* Animated glow on the timeline */}
          <div
            className="absolute top-0 w-[3px] h-24 z-[1] animate-timeline-glow"
            style={{
              left: isRTL ? "auto" : "50%",
              right: isRTL ? "50%" : "auto",
              transform: "translateX(50%)",
              background: "linear-gradient(to bottom, transparent, #1B7A6E, #6BCDB8, #1B7A6E, transparent)",
              opacity: 0.7,
            }}
          />

          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const alignClass = isRTL
              ? isLeft
                ? "md:pr-[55%]"
                : "md:pl-[55%]"
              : isLeft
                ? "md:pr-[55%]"
                : "md:pl-[55%]";

            return (
              <div
                key={step.number}
                className={`relative mb-12 last:mb-0 ${alignClass}`}
              >
                {/* Timeline node — number circle on the line */}
                <div
                  className="absolute top-8 z-10"
                  style={{
                    left: isRTL ? "auto" : "50%",
                    right: isRTL ? "50%" : "auto",
                    transform: "translateX(50%)",
                  }}
                >
                  {/* Pulse ring */}
                  <div className={`absolute inset-0 ${step.pulseColor} rounded-full opacity-30 animate-ping-slow`} />
                  <div className={`absolute inset-[-4px] ${step.pulseColor} rounded-full opacity-15 animate-ping-slower`} />
                  {/* Number circle */}
                  <div
                    className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.shadow} border-2 border-white/20`}
                  >
                    <span className="text-white font-display font-bold text-lg">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="process-card relative z-[2] bg-white/[0.06] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.08] group">
                  {/* Coral accent for step 3 */}
                  {step.isCoral && (
                    <div className="absolute top-0 start-0 end-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#E8637C] to-[#F4939F]" />
                  )}

                  {/* Hover gradient border effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      padding: "2px",
                      background: step.isCoral
                        ? "linear-gradient(135deg, #E8637C, #F4939F, #1B7A6E)"
                        : "linear-gradient(135deg, #1B7A6E, #2DA89E, #6BCDB8)",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />

                  <step.Icon className={`w-7 h-7 mb-4 ${step.isCoral ? "text-[#E8637C]/70" : "text-teal-300/60"}`} />
                  <h3 className="font-bold text-white text-lg mb-3">
                    {step.title}
                  </h3>
                  <div className={`w-8 h-0.5 bg-gradient-to-r ${step.isCoral ? "from-[#E8637C]/50 to-transparent" : "from-teal-400/40 to-transparent"} mx-auto mt-3 mb-4`} />
                  <p className="text-sm text-teal-200/60 leading-[1.8]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile: Simple Stacked Cards */}
        <div className="grid gap-6 md:hidden stagger">
          {steps.map((step) => (
            <div key={step.number} className="proc-connector relative text-center">
              <div className="relative z-[1] process-card bg-white/[0.06] backdrop-blur-sm p-8 rounded-3xl border border-white/[0.08] group">
                {/* Coral accent for step 3 */}
                {step.isCoral && (
                  <div className="absolute top-0 start-0 end-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#E8637C] to-[#F4939F]" />
                )}

                <div className="relative mx-auto mb-6 w-fit">
                  {/* Pulse ring — mobile */}
                  <div className={`absolute inset-0 ${step.pulseColor} rounded-2xl opacity-30 animate-ping-slow`} />
                  <div
                    className={`relative proc-num w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg ${step.shadow}`}
                  >
                    <span className="text-white font-display font-bold text-xl">
                      {step.number}
                    </span>
                  </div>
                </div>

                <step.Icon className={`w-6 h-6 mx-auto mb-4 ${step.isCoral ? "text-[#E8637C]/60" : "text-teal-300/60"}`} />
                <h3 className="font-bold text-white text-lg mb-3">
                  {step.title}
                </h3>
                <div className={`w-8 h-0.5 bg-gradient-to-r ${step.isCoral ? "from-[#E8637C]/50 to-transparent" : "from-teal-400/40 to-transparent"} mx-auto mt-3 mb-4`} />
                <p className="text-sm text-teal-200/60 leading-[1.8]">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
