"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { Stethoscope } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types for API response                                             */
/* ------------------------------------------------------------------ */
interface ApiCollaborationItem {
  id: string;
  name: string;
  image: string;
  sort_order: number;
}

/* ------------------------------------------------------------------ */
/*  Skeleton placeholder for loading state                             */
/* ------------------------------------------------------------------ */
function CollaborationSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-2xl border border-gray-100/80 p-6 flex flex-col items-center gap-3"
        >
          <div className="w-24 h-24 rounded-2xl bg-gray-200/60" />
          <div className="h-3 w-24 bg-gray-200/60 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single collaboration item                                          */
/* ------------------------------------------------------------------ */
function CollaborationCard({ item, index }: { item: ApiCollaborationItem; index: number }) {
  const [imgError, setImgError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasImage = item.image && item.image.trim() !== "" && !imgError;

  // Trigger entrance animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 60 + index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 flex flex-col items-center gap-3 hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-1 transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Logo image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden flex items-center justify-center bg-teal-50/80 shrink-0">
        {hasImage ? (
          <img
            src={item.image}
            alt={item.name || "دندانپزشک"}
            className="w-full h-full object-contain p-2 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-teal-300">
            <Stethoscope className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Name */}
      <span className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-[#1B7A6E] transition-colors duration-300 text-center leading-snug min-h-[1.5em] line-clamp-2">
        {item.name || "—"}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Collaborations component                                      */
/* ------------------------------------------------------------------ */
export default function Collaborations() {
  const { t, locale } = useI18n();

  const [items, setItems] = useState<ApiCollaborationItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* Fetch collaboration items from API */
  useEffect(() => {
    let cancelled = false;

    async function fetchCollaborations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/collaborations?lang=${locale}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (cancelled) return;

        const fetched: ApiCollaborationItem[] = data.items;
        if (Array.isArray(fetched) && fetched.length > 0) {
          setItems(fetched);
        } else {
          setItems([]);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCollaborations();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  /* Don't render if no collaborations exist */
  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section
      id="collaborations"
      className="py-12 sm:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white via-teal-50/20 to-white"
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #1B7A6E 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-16">
          <span className="inline-flex items-center gap-2.5 text-teal-700 font-semibold text-[12px] mb-3">
            <span className="w-8 h-[2px] rounded-full bg-gradient-to-l from-teal-400 to-teal-600" />
            {t("collaborations.label")}
            <span className="w-8 h-[2px] rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
          </span>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.15] mb-4" style={{ color: "#0D3A35" }}>
            {t("collaborations.label")}
          </h2>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {t("collaborations.subtitle")}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <CollaborationSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {items.map((item, idx) => (
              <CollaborationCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
