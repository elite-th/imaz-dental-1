"use client";

import { Instagram, Linkedin } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

/* ── Avatar initials circle ── */
function AvatarInitials({ name, featured }: { name: string; featured?: boolean }) {
  // Extract initials: first letter of first and last word
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);

  return (
    <div
      className={`
        relative flex items-center justify-center rounded-full
        bg-gradient-to-br from-teal-500 to-teal-400
        shadow-lg shadow-teal-500/20
        ${featured ? "w-28 h-28 text-3xl" : "w-24 h-24 text-2xl"}
        font-bold text-white uppercase tracking-wide
      `}
    >
      {initials}
    </div>
  );
}

/* ── Team member card ── */
interface TeamMemberProps {
  nameKey: string;
  specialtyKey: string;
  descKey: string;
  featured?: boolean;
  index: number;
}

function TeamMemberCard({ nameKey, specialtyKey, descKey, featured, index }: TeamMemberProps) {
  const { t } = useI18n();
  const name = t(nameKey);
  const specialty = t(specialtyKey);
  const desc = t(descKey);

  return (
    <div
      className={`
        reveal d${index + 1}
        group relative rounded-2xl overflow-hidden
        bg-white border border-transparent team-card-shadow
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:border-teal-500/30
        ${featured ? "md:row-span-1 md:col-span-1" : ""}
      `}
    >
      {/* Featured coral accent stripe */}
      {featured && (
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#E8637C] to-[#E8637C]/70 z-10" />
      )}

      {/* Top: gradient background with avatar */}
      <div
        className={`
          relative flex items-center justify-center
          bg-gradient-to-b from-teal-500/5 to-teal-400/10
          ${featured ? "py-12" : "py-10"}
        `}
      >
        <AvatarInitials name={name} featured={featured} />

        {/* Featured badge */}
        {featured && (
          <span className="absolute top-5 start-5 px-3 py-1 rounded-full bg-[#E8637C] text-white text-[11px] font-bold tracking-wide shadow-md shadow-[#E8637C]/30">
            {t("team.head_badge")}
          </span>
        )}
      </div>

      {/* Bottom: info */}
      <div className={`px-6 ${featured ? "pb-8 pt-6" : "pb-6 pt-5"}`}>
        <h3
          className={`
            font-display font-bold text-[#1A2332] leading-tight mb-1
            ${featured ? "text-xl" : "text-lg"}
          `}
        >
          {name}
        </h3>
        <p className="text-teal-600 font-semibold text-sm mb-3">{specialty}</p>
        <p className="text-[#1A2332]/60 text-sm leading-[1.8] mb-5">{desc}</p>

        {/* Social links */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            aria-label="Instagram"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#1A2332]/10 text-[#1A2332]/40 transition-all duration-300 hover:bg-teal-500 hover:border-teal-500 hover:text-white"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            className="w-9 h-9 rounded-full flex items-center justify-center border border-[#1A2332]/10 text-[#1A2332]/40 transition-all duration-300 hover:bg-teal-500 hover:border-teal-500 hover:text-white"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main Team section ── */
export default function Team() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const sectionRef = useScrollReveal();

  const members: TeamMemberProps[] = [
    { nameKey: "team.name1", specialtyKey: "team.specialty1", descKey: "team.desc1", featured: true, index: 0 },
    { nameKey: "team.name2", specialtyKey: "team.specialty2", descKey: "team.desc2", index: 1 },
    { nameKey: "team.name3", specialtyKey: "team.specialty3", descKey: "team.desc3", index: 2 },
    { nameKey: "team.name4", specialtyKey: "team.specialty4", descKey: "team.desc4", index: 3 },
  ];

  return (
    <section
      id="team"
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden bg-white"
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle,#1B7A6E 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-20">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-600 font-semibold text-[12px] mb-5">
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
            {t("team.label")}
            <span
              className={`w-8 h-[2px] rounded-full ${
                isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"
              } from-teal-400/60 to-teal-500/60`}
            />
          </span>
          <h2 className="reveal d1 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A2332] leading-[1.15]">
            {t("team.heading")}
          </h2>
        </div>

        {/* Team grid — 2×2 on md+, 1 col on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 stagger">
          {members.map((member) => (
            <TeamMemberCard key={member.nameKey} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
