import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/context";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://imazdental.com";

const dmSans = localFont({
  variable: "--font-dm-sans",
  src: [
    { path: "../../public/fonts/dm-sans-extralight.woff2", weight: "200", style: "normal" },
    { path: "../../public/fonts/dm-sans-regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/dm-sans-medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/dm-sans-semibold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/dm-sans-bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const playfair = localFont({
  variable: "--font-playfair",
  src: [
    { path: "../../public/fonts/playfair-regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/playfair-medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/playfair-semibold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/playfair-bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/playfair-extrabold.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

const vazirmatn = localFont({
  variable: "--font-vazirmatn",
  src: [
    { path: "../../public/fonts/vazirmatn.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/vazirmatn-medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/vazirmatn-semibold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/vazirmatn-bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // ── Title & Description ──
  title: {
    default: "کلینیک دندانپزشکی ایماز — لبخند رویایی شما | Imaz Dental Clinic",
    template: "%s | کلینیک دندانپزشکی ایماز",
  },
  description:
    "تجربه مراقبت‌های دندانپزشکی جهانی در محیطی آرام و لوکس. خدمات ایمپلنت دیجیتال، درمان ریشه، طراحی لبخند، ارتودنسی و زیبایی دندان. کلینیک دندانپزشکی ایماز - راحتی و اعتماد شما تنها اولویت ماست.",
  keywords: [
    // فارسی
    "ایماز", "کلینیک دندانپزشکی ایماز", "دندانپزشکی", "ایمپلنت", "ونیر",
    "طراحی لبخند", "کلینیک دندانپزشکی", "دندانپزشک", "درمان ریشه",
    "ارتودنسی", "پروتز دندان", "دندانپزشکی اطفال", "زیبایی دندان",
    "ایمپلنت دیجیتال", "لیمر", "بلیچینگ",
    // English
    "imaz dental", "imaz dental clinic", "dental clinic", "dentist",
    "dental implant", "smile design", "veneer", "root canal",
    "orthodontics", "dental prosthesis", "pediatric dentistry",
    // العربية
    "عيادة أسنان إيماز", "طبيب أسنان", "زراعة أسنان", "تصميم ابتسامة",
  ],
  authors: [{ name: "کلینیک دندانپزشکی ایماز", url: SITE_URL }],
  creator: "Imaz Dental Clinic",
  publisher: "Imaz Dental Clinic",

  // ── Icons ──
  icons: {
    icon: "/favicon-new.svg",
  },

  // ── Canonical & Language Alternates ──
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fa-IR": SITE_URL,
      "en-US": `${SITE_URL}/?lang=en`,
      "ar-SA": `${SITE_URL}/?lang=ar`,
    },
  },

  // ── Open Graph ──
  openGraph: {
    type: "website",
    locale: "fa_IR",
    alternateLocale: ["en_US", "ar_SA"],
    url: SITE_URL,
    siteName: "کلینیک دندانپزشکی ایماز",
    title: "کلینیک دندانپزشکی ایماز — لبخند رویایی شما",
    description:
      "تجربه مراقبت‌های دندانپزشکی جهانی در محیطی آرام و لوکس. خدمات ایمپلنت دیجیتال، درمان ریشه، طراحی لبخند و ارتودنسی.",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "کلینیک دندانپزشکی ایماز — لبخند رویایی شما",
      },
    ],
  },

  // ── Twitter Card ──
  twitter: {
    card: "summary_large_image",
    title: "کلینیک دندانپزشکی ایماز — لبخند رویایی شما",
    description:
      "تجربه مراقبت‌های دندانپزشکی جهانی در محیطی آرام و لوکس. خدمات ایمپلنت دیجیتال، درمان ریشه، طراحی لبخند و ارتودنسی.",
    images: [`${SITE_URL}/images/og-image.png`],
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Category ──
  category: "health",

  // ── Verification placeholders (fill with real values) ──
  // verification: {
  //   google: "YOUR_GOOGLE_VERIFICATION_CODE",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* ── JSON-LD Structured Data: Dentist / LocalBusiness ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dentist",
              name: "کلینیک دندانپزشکی ایماز",
              alternateName: ["Imaz Dental Clinic", "عيادة أسنان إيماز"],
              url: SITE_URL,
              logo: `${SITE_URL}/images/imaz-logo.png`,
              image: `${SITE_URL}/images/hero-dental.png`,
              description:
                "تجربه مراقبت‌های دندانپزشکی جهانی در محیطی آرام و لوکس. خدمات ایمپلنت دیجیتال، درمان ریشه، طراحی لبخند، ارتودنسی و زیبایی دندان.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "خیابان ولیعصر",
                addressLocality: "تهران",
                addressCountry: "IR",
              },
              telephone: "+98-21-1234-5678",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Saturday",
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                  ],
                  opens: "09:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: "Thursday",
                  opens: "09:00",
                  closes: "14:00",
                },
              ],
              priceRange: "$$",
              medicalSpecialty: [
                "Dentistry",
                "Orthodontics",
                "Endodontics",
                "Prosthodontics",
                "PediatricDentistry",
              ],
              availableService: [
                {
                  "@type": "MedicalTherapy",
                  name: "ایمپلنت دیجیتال و پیوند استخوان",
                },
                {
                  "@type": "MedicalTherapy",
                  name: "درمان تخصصی ریشه",
                },
                {
                  "@type": "MedicalTherapy",
                  name: "طراحی لبخند و زیبایی",
                },
                {
                  "@type": "MedicalTherapy",
                  name: "ارتودنسی",
                },
                {
                  "@type": "MedicalTherapy",
                  name: "پروتزهای ثابت و متحرک",
                },
                {
                  "@type": "MedicalTherapy",
                  name: "دندانپزشکی اطفال",
                },
              ],
              sameAs: [
                SITE_URL,
              ],
            }),
          }}
        />
        {/* ── JSON-LD: WebSite (for search sitelinks searchbox) ── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "کلینیک دندانپزشکی ایماز",
              alternateName: "Imaz Dental Clinic",
              url: SITE_URL,
              inLanguage: ["fa-IR", "en-US", "ar-SA"],
            }),
          }}
        />
      </head>
      <body
        className={`${dmSans.variable} ${playfair.variable} ${vazirmatn.variable} font-sans antialiased grain`}
        style={{ color: "#1E1E1E", overflowX: "hidden" }}
      >
        <I18nProvider>
          {children}
        </I18nProvider>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
