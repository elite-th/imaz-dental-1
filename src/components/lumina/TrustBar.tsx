"use client";

import { useI18n } from "@/i18n/context";
import { Shield, Award, FileCheck, Stethoscope, Globe, Stamp } from "lucide-react";

export default function TrustBar() {
  const { t, dir } = useI18n();

  /* Logical gradient directions: in LTR fade-in from edges, in RTL flip */
  const startFade = dir === "rtl"
    ? "linear-gradient(to left, #FAFCFB, transparent)"
    : "linear-gradient(to right, #FAFCFB, transparent)";
  const endFade = dir === "rtl"
    ? "linear-gradient(to right, #FAFCFB, transparent)"
    : "linear-gradient(to left, #FAFCFB, transparent)";

  const brands = [
    { text: t("trustbar.brand_1"), Icon: Shield },
    { text: t("trustbar.brand_2"), Icon: Stethoscope },
    { text: t("trustbar.brand_3"), Icon: FileCheck },
    { text: t("trustbar.brand_4"), Icon: Award },
    { text: t("trustbar.brand_5"), Icon: Globe },
    { text: t("trustbar.brand_6"), Icon: Stamp },
  ];

  return (
    <section
      className="py-8 border-y border-teal-100/60 overflow-hidden"
      style={{ background: "#FAFCFB" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mb-4">
        <p className="text-center text-[11px] font-semibold text-teal-500/80 uppercase tracking-[0.2em]">
          {t("trustbar.heading")}
        </p>
      </div>
      <div className="relative">
        <div
          className="absolute start-0 top-0 bottom-0 w-24 z-10"
          style={{ background: startFade }}
        />
        <div
          className="absolute end-0 top-0 bottom-0 w-24 z-10"
          style={{ background: endFade }}
        />
        <div className="logo-scroll flex items-center gap-16 w-max">
          {brands.map((brand, i) => (
            <span
              key={`a-${i}`}
              className="flex items-center gap-2 text-teal-400/80 font-display font-bold text-lg whitespace-nowrap"
            >
              <brand.Icon className="w-4 h-4" />
              {brand.text}
            </span>
          ))}
          {brands.map((brand, i) => (
            <span
              key={`b-${i}`}
              className="flex items-center gap-2 text-teal-400/80 font-display font-bold text-lg whitespace-nowrap"
            >
              <brand.Icon className="w-4 h-4" />
              {brand.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
