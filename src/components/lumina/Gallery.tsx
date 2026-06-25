"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowRight, Sparkles, Eye } from "lucide-react";
import { useScrollReveal, scrollToElement } from "@/hooks/use-lumina";

import { useI18n } from "@/i18n/context";

/* ================================================================== */
/*  HoverRevealCard — Luxurious before/after transformation on hover   */
/* ================================================================== */
interface HoverRevealCardProps {
  afterSrc: string;
  beforeSrc: string;
  label: string;
  sublabel: string;
  beforeLabel: string;
  afterLabel: string;
}

function HoverRevealCard({
  afterSrc,
  beforeSrc,
  label,
  sublabel,
  beforeLabel,
  afterLabel,
}: HoverRevealCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="gallery-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="gallery-card__images">
        {/* After image — fades in on hover */}
        <img
          src={afterSrc}
          alt={afterLabel}
          draggable={false}
          className="gallery-card__img gallery-card__img--after"
        />

        {/* Before image — fades out on hover */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          draggable={false}
          className="gallery-card__img gallery-card__img--before"
          style={{ opacity: isHovered ? 0 : 1 }}
        />

        {/* Corner decoration */}
        <div className="gallery-card__corner gallery-card__corner--tl" />
        <div className="gallery-card__corner gallery-card__corner--br" />

        {/* Before/After badges */}
        <div
          className="gallery-card__badge gallery-card__badge--before"
          style={{ opacity: isHovered ? 0 : 1 }}
        >
          <Eye className="w-3 h-3" />
          <span>{beforeLabel}</span>
        </div>
        <div
          className="gallery-card__badge gallery-card__badge--after"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <Sparkles className="w-3 h-3" />
          <span>{afterLabel}</span>
        </div>
      </div>

      {/* Card info section */}
      <div className="gallery-card__info">
        <div className="gallery-card__info-label">{label}</div>
        <div className="gallery-card__info-sublabel">{sublabel}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Types for API response                                             */
/* ------------------------------------------------------------------ */
interface ApiGalleryItem {
  id: string;
  title: string;
  subtitle: string;
  before_image: string;
  after_image: string;
  sort_order: number;
}

interface GalleryDisplayItem {
  label: string;
  sublabel: string;
  afterSrc: string;
  beforeSrc: string;
}

/* ------------------------------------------------------------------ */
/*  Skeleton placeholder for loading state                             */
/* ------------------------------------------------------------------ */
function GallerySkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="gallery-card animate-pulse">
          <div className="gallery-card__images aspect-[4/5] bg-gray-200/60 rounded-2xl" />
          <div className="gallery-card__info">
            <div className="h-4 w-24 bg-gray-200/60 rounded" />
            <div className="h-3 w-32 bg-gray-100/60 rounded mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Gallery component                                             */
/* ------------------------------------------------------------------ */
export default function Gallery() {
  const sectionRef = useScrollReveal();
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";

  const [galleryItems, setGalleryItems] = useState<GalleryDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* Hardcoded fallback data */
  const getFallbackItems = useCallback((): GalleryDisplayItem[] => [
    {
      label: t("gallery.item_1_title"),
      sublabel: t("gallery.item_1_sub"),
      afterSrc: "/images/after-1.png",
      beforeSrc: "/images/before-1.png",
    },
    {
      label: t("gallery.item_2_title"),
      sublabel: t("gallery.item_2_sub"),
      afterSrc: "/images/after-2.png",
      beforeSrc: "/images/before-2.png",
    },
    {
      label: t("gallery.item_3_title"),
      sublabel: t("gallery.item_3_sub"),
      afterSrc: "/images/after-3.png",
      beforeSrc: "/images/before-3.png",
    },
  ], [t]);

  /* Fetch gallery items from API */
  useEffect(() => {
    let cancelled = false;

    async function fetchGallery() {
      setLoading(true);
      try {
        const res = await fetch(`/api/gallery?lang=${locale}`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        if (cancelled) return;

        const items: ApiGalleryItem[] = data.items;
        if (Array.isArray(items) && items.length > 0) {
          setGalleryItems(
            items.map((item) => ({
              label: item.title,
              sublabel: item.subtitle,
              afterSrc: item.after_image,
              beforeSrc: item.before_image,
            }))
          );
        } else {
          setGalleryItems(getFallbackItems());
        }
      } catch {
        if (!cancelled) {
          setGalleryItems(getFallbackItems());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchGallery();
    return () => { cancelled = true; };
  }, [locale, getFallbackItems]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-12 sm:py-16 lg:py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBF9 30%, #F5F0EB 70%, #F0EBE3 100%)" }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "radial-gradient(circle, #1B7A6E 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-32 -end-32 w-64 h-64 rounded-full bg-teal-100/20 blur-3xl" />
      <div className="absolute -bottom-24 -start-24 w-56 h-56 rounded-full bg-amber-100/20 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <h2 className="reveal d1 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A2332] leading-[1.1] mb-4">
            {t("gallery.heading")}
          </h2>
          <p className="reveal d2 text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {t("gallery.subtitle")}
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <GallerySkeleton />
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {galleryItems.map((item, idx) => (
              <div key={idx} className={`reveal d${Math.min(idx + 1, 4)}`}>
                <HoverRevealCard
                  afterSrc={item.afterSrc}
                  beforeSrc={item.beforeSrc}
                  label={item.label}
                  sublabel={item.sublabel}
                  beforeLabel={t("gallery.before")}
                  afterLabel={t("gallery.after")}
                />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-14 reveal d4">
            <button
              onClick={() => scrollToElement("#booking")}
              className="btn-cta inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl text-white font-bold text-[13px] shadow-lg shadow-teal-500/20"
            >
              {t("gallery.cta")}{" "}
              <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
            </button>
        </div>
      </div>
    </section>
  );
}
