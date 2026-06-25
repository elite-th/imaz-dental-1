"use client";

import { Wrench, Gem, Sun, Smile, WandSparkles, Baby, ArrowUpLeft } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

export default function Services() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const sectionRef = useScrollReveal();

  const services = [
    {
      icon: Wrench,
      title: t("services.svc_1_title"),
      description: t("services.svc_1_desc"),
      accent: "teal",
    },
    {
      icon: Gem,
      title: t("services.svc_2_title"),
      description: t("services.svc_2_desc"),
      accent: "coral",
    },
    {
      icon: Sun,
      title: t("services.svc_3_title"),
      description: t("services.svc_3_desc"),
      accent: "gold",
    },
    {
      icon: Smile,
      title: t("services.svc_4_title"),
      description: t("services.svc_4_desc"),
      accent: "emerald",
    },
    {
      icon: WandSparkles,
      title: t("services.svc_5_title"),
      description: t("services.svc_5_desc"),
      accent: "violet",
    },
    {
      icon: Baby,
      title: t("services.svc_6_title"),
      description: t("services.svc_6_desc"),
      accent: "orange",
    },
  ];

  const accentStyles: Record<string, { iconBg: string; iconColor: string; hoverBorder: string; ringColor: string }> = {
    teal:    { iconBg: "bg-teal-50",    iconColor: "text-teal-600",    hoverBorder: "hover:border-teal-300/50",    ringColor: "ring-teal-500/15" },
    coral:   { iconBg: "bg-rose-50",    iconColor: "text-rose-500",    hoverBorder: "hover:border-rose-300/50",    ringColor: "ring-rose-500/15" },
    gold:    { iconBg: "bg-amber-50",   iconColor: "text-amber-600",   hoverBorder: "hover:border-amber-300/50",   ringColor: "ring-amber-500/15" },
    orange:  { iconBg: "bg-orange-50",  iconColor: "text-orange-600",  hoverBorder: "hover:border-orange-300/50",  ringColor: "ring-orange-500/15" },
    emerald: { iconBg: "bg-emerald-50", iconColor: "text-emerald-600", hoverBorder: "hover:border-emerald-300/50", ringColor: "ring-emerald-500/15" },
    violet:  { iconBg: "bg-violet-50",  iconColor: "text-violet-600",  hoverBorder: "hover:border-violet-300/50",  ringColor: "ring-violet-500/15" },
    slate:   { iconBg: "bg-slate-50",   iconColor: "text-slate-600",   hoverBorder: "hover:border-slate-300/50",   ringColor: "ring-teal-500/15" },
  };

  return (
      <section
        id="services"
        ref={sectionRef}
        className="py-8 sm:py-12 lg:py-16 relative overflow-hidden min-h-[calc(100dvh-80px)] flex flex-col justify-center"
        style={{
          background: "linear-gradient(160deg, #F0FAF8 0%, #E8F5F1 25%, #F5F9F7 50%, #EDF7F3 75%, #F0FAF8 100%)",
        }}
      >
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            opacity: 0.3,
            backgroundImage:
              "radial-gradient(circle, #2DA89E 0.5px, transparent 0.5px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Background glow blobs — soft teal/mint */}
        <div className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "linear-gradient(135deg, #A8E0D5, #6BCDB8)" }} />
        <div className="absolute bottom-0 start-0 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl" style={{ background: "linear-gradient(135deg, #D5F0EB, #A8E0D5)" }} />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl" style={{ background: "#6BCDB8" }} />

        <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <span className="reveal inline-flex items-center gap-2.5 text-teal-600 font-semibold text-[12px] mb-3 tracking-[0.15em] uppercase">
              <span className={`w-10 sm:w-14 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-transparent to-teal-500`} />
              {t("services.label")}
              <span className={`w-10 sm:w-14 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-transparent to-teal-500`} />
            </span>
            <h2
              className="reveal d1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.15] mb-3 text-teal-900"
            >
              {t("services.heading")}
            </h2>
            <p className="reveal d2 text-teal-700/50 text-sm sm:text-base leading-[1.8]">
              {t("services.subtitle")}
            </p>
          </div>

          {/* Service Cards — Light glass cards on light bg */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {services.map((service, index) => {
              const style = accentStyles[service.accent] || accentStyles.teal;
              const Icon = service.icon;

              return (
                <div
                  key={index}
                  className={`svc-light-card group relative rounded-2xl border border-teal-100/60 bg-white/70 backdrop-blur-sm p-4 sm:p-5 transition-all duration-400 cursor-pointer hover:bg-white/90 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 ${style.hoverBorder}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg ${style.iconBg} ${style.iconColor} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg] ring-1 ${style.ringColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-[14px] mb-1 text-teal-900">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[12px] text-teal-800/40 leading-[1.8] mb-2">
                    {service.description}
                  </p>

                  {/* Learn more link */}
                  <div className="flex items-center gap-1.5 text-teal-600 text-[12px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>{t("services.learn_more")}</span>
                    <ArrowUpLeft className={`w-3 h-3 ${isRTL ? "scale-x-[-1]" : ""}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
  );
}
