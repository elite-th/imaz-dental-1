"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import { type Locale, type Direction, getDirection } from "./types";

import en from "./en.json";
import fa from "./fa.json";
import ar from "./ar.json";

/* ------------------------------------------------------------------ */
/*  Translation dictionaries (static fallback)                         */
/* ------------------------------------------------------------------ */
const staticMessages: Record<Locale, typeof en> = { en, fa, ar };

/* ------------------------------------------------------------------ */
/*  Override storage — loaded from DB via /api/site-text               */
/*  Key format: "hero.badge" → { fa: "...", en: "...", ar: "..." }    */
/* ------------------------------------------------------------------ */
type OverrideMap = Record<string, Record<Locale, string>>;

const OVERRIDES_CACHE_KEY = "imaz-i18n-overrides";
const OVERRIDES_VERSION_KEY = "imaz-i18n-overrides-version";

/* ------------------------------------------------------------------ */
/*  Context shape                                                      */
/* ------------------------------------------------------------------ */
interface I18nContextValue {
  locale: Locale;
  dir: Direction;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  Helper: resolve nested key like "hero.badge"                      */
/* ------------------------------------------------------------------ */
function getNestedValue(obj: Record<string, unknown>, keyPath: string): string {
  const keys = keyPath.split(".");
  let current: unknown = obj;
  for (const k of keys) {
    if (current == null || typeof current !== "object") return keyPath;
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === "string" ? current : keyPath;
}

/* ------------------------------------------------------------------ */
/*  Helper: load overrides from localStorage cache                     */
/* ------------------------------------------------------------------ */
function loadCachedOverrides(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const cached = localStorage.getItem(OVERRIDES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

/* ------------------------------------------------------------------ */
/*  Helper: save overrides to localStorage cache                       */
/* ------------------------------------------------------------------ */
function cacheOverrides(overrides: OverrideMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OVERRIDES_CACHE_KEY, JSON.stringify(overrides));
    localStorage.setItem(OVERRIDES_VERSION_KEY, Date.now().toString());
  } catch {
    // ignore quota errors
  }
}

/* ------------------------------------------------------------------ */
/*  External store for locale — avoids hydration mismatch              */
/*  During SSR and hydration, always returns "fa".                     */
/*  After mount, reads from localStorage.                              */
/* ------------------------------------------------------------------ */
const LOCALE_KEY = "lumina-locale";
const VALID_LOCALES: Locale[] = ["en", "fa", "ar"];

let clientReady = false;

function subscribeToLocale(callback: () => void) {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("locale-update", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("locale-update", handler);
  };
}

const DEFAULT_LOCALE: Locale = "fa";

function getLocaleSnapshot(): Locale {
  if (!clientReady) return DEFAULT_LOCALE; // Match server during hydration
  const saved = localStorage.getItem(LOCALE_KEY);
  if (saved && VALID_LOCALES.includes(saved as Locale)) return saved as Locale;
  return DEFAULT_LOCALE;
}

function getLocaleServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

/* ------------------------------------------------------------------ */
/*  useLayoutEffect that works in SSR                                  */
/* ------------------------------------------------------------------ */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getLocaleServerSnapshot,
  );

  const dir = getDirection(locale);

  /* ---- Override state ---- */
  // Start with empty overrides to match SSR (avoids hydration mismatch).
  // Overrides are loaded from API after mount.
  const [overrides, setOverrides] = useState<OverrideMap>({});

  /* After mount: allow reading from localStorage for locale */
  useEffect(() => {
    clientReady = true;
    // Trigger re-render to pick up the real locale from localStorage
    window.dispatchEvent(new Event("locale-update"));
  }, []);

  /* ---- Load overrides from API ---- */
  useEffect(() => {
    let stale = false;

    async function fetchOverrides() {
      try {
        const res = await fetch("/api/site-text");
        if (!res.ok || stale) return;
        const data = await res.json();

        // data.texts is an array of { key, value_fa, value_en, value_ar, ... }
        if (!Array.isArray(data.texts) || stale) return;

        const map: OverrideMap = {};
        for (const item of data.texts) {
          if (!item.key) continue;
          map[item.key] = {
            fa: item.value_fa || "",
            en: item.value_en || "",
            ar: item.value_ar || "",
          };
        }

        // Only update if we got meaningful data
        if (Object.keys(map).length > 0 && !stale) {
          setOverrides(map);
          cacheOverrides(map);
        }
      } catch (err) {
        // API fetch failed — static translations are still used
        console.warn("[I18n] Failed to fetch site text overrides:", err);
      }
    }

    fetchOverrides();

    // Refresh overrides every 60 seconds to pick up admin changes
    const interval = setInterval(fetchOverrides, 60_000);
    return () => {
      stale = true;
      clearInterval(interval);
    };
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    const prevLocale = localStorage.getItem(LOCALE_KEY);
    if (prevLocale === newLocale) return; // no change, skip

    // Save scroll position before the switch
    const scrollY = window.scrollY;

    // Mark as transitioning (triggers CSS opacity transition to mask the reflow)
    document.documentElement.setAttribute("data-i18n-transitioning", "true");

    localStorage.setItem(LOCALE_KEY, newLocale);

    // Small delay to let the CSS transition mask kick in
    setTimeout(() => {
      // Trigger re-render via the external store subscription
      window.dispatchEvent(new Event("locale-update"));

      // After the layout has settled, restore scroll position and end transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
          document.documentElement.removeAttribute("data-i18n-transitioning");
        });
      });
    }, 80);
  }, []);

  /* Apply dir & lang to <html> synchronously (before paint) */
  useIsomorphicLayoutEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", dir);
    html.setAttribute("lang", locale);
  }, [locale, dir]);

  /* ---- Translation function: overrides first, then static fallback ---- */
  const t = useCallback(
    (key: string): string => {
      // 1. Check DB overrides first (admin-edited texts)
      const override = overrides[key];
      if (override && override[locale]) {
        const val = override[locale].trim();
        if (val) return val;
      }

      // 2. Fall back to static JSON translations
      return getNestedValue(staticMessages[locale] as unknown as Record<string, unknown>, key) || key;
    },
    [locale, overrides],
  );

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
