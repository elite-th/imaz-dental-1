"use client";

import { Microscope, Sparkles, HeartHandshake, Award, ArrowRight } from "lucide-react";
import { useScrollReveal, scrollToElement } from "@/hooks/use-lumina";

import { useI18n } from "@/i18n/context";

export default function About() {
  const sectionRef = useScrollReveal();
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  const features = [
    {
      icon: Microscope,
      title: t("about.feature_1_title"),
      description: t("about.feature_1_desc"),
      gradient: "from-teal-100 to-teal-200",
      iconColor: "text-teal-700",
    },
    {
      icon: Sparkles,
      title: t("about.feature_2_title"),
      description: t("about.feature_2_desc"),
      gradient: "from-teal-200 to-teal-300",
      iconColor: "text-teal-800",
    },
    {
      icon: HeartHandshake,
      title: t("about.feature_3_title"),
      description: t("about.feature_3_desc"),
      gradient: "from-teal-300 to-teal-400",
      iconColor: "text-teal-900",
    },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative min-h-[calc(100dvh-80px)] flex flex-col justify-center"
      style={{ background: "#FFFFFF" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <div className="reveal-left relative flex justify-center lg:justify-start">
            {/* Decorative teal frame */}
            <div className="relative p-1 rounded-[2.25rem] w-[320px] sm:w-[380px] lg:w-full" style={{ background: "linear-gradient(135deg, rgba(27,122,110,0.2), rgba(27,122,110,0.05), rgba(27,122,110,0.15))" }}>
              {/* Corner accent — top right */}
              <div className="absolute -top-2 -end-2 w-8 h-8 border-t-2 border-e-2 border-[#1B7A6E]/20 rounded-tr-2xl z-10" />
              {/* Corner accent — bottom left */}
              <div className="absolute -bottom-2 -start-2 w-8 h-8 border-b-2 border-s-2 border-[#1B7A6E]/20 rounded-bl-2xl z-10" />
              <div className="relative rounded-[2rem] overflow-hidden shadow-xl shadow-teal-900/8">
                <img
                  src="/images/dentist-portrait.jpg"
                  alt={t("about.img_alt")}
                  className="w-full h-auto aspect-[3/4] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-950/50 via-transparent to-transparent" />
                <div className="absolute bottom-0 start-0 end-0 p-3 sm:p-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/30">
                    <div className="flex items-center gap-2.5 sm:gap-4">
                      <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
                        <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-[11px] sm:text-sm text-teal-900">
                          {t("about.badge_name")}
                        </div>
                        <div className="text-[9px] sm:text-xs mt-0.5 text-teal-700/60">
                          {t("about.badge_sub")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute -top-6 -start-6 w-28 h-28 opacity-15 hidden lg:block"
              style={{
                backgroundImage: "radial-gradient(circle,#0F766E 2px,transparent 2px)",
                backgroundSize: "14px 14px",
              }}
            />
          </div>

          {/* Right: Content */}
          <div>
            <div className="reveal">
              <span className="inline-flex items-center gap-2.5 text-teal-700 font-semibold text-[12px] mb-3">
                <span className={`w-8 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-teal-400 to-teal-600`} />
                {t("about.label")}
              </span>
            </div>

            <h2
              className="reveal d1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.15] mb-4"
              style={{ color: "#0D3A35" }}
            >
              {t("about.heading_l1")} <span className="text-teal-600">{t("about.heading_l2")}</span>
            </h2>

            <p className="reveal d2 text-teal-800/55 text-sm sm:text-base leading-[1.8] mb-6">
              {t("about.description")}
            </p>

            <div className="space-y-3 mb-6 stagger">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-teal-100/40 transition-colors"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}
                  >
                    <feature.icon className={`w-4 h-4 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-teal-900 mb-0.5 text-[14px]">{feature.title}</h4>
                    <p className="text-[13px] text-teal-800/55 leading-[1.8]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal d5">
                <button
                  onClick={() => scrollToElement("#booking")}
                  className="btn-cta inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-[13px] shadow-lg shadow-teal-500/20"
                >
                  {t("about.cta")} <ArrowRight className="w-3 h-3 rtl:-scale-x-100" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
