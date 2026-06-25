"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Phone, ArrowRight, Calendar } from "lucide-react";
import { scrollToElement } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

import LanguageSwitcher from "@/components/lumina/LanguageSwitcher";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const NAV_LINKS = [
    { label: t("header.nav_about"), href: "#about" },
    { label: t("header.nav_services"), href: "#services" },
    { label: t("header.nav_results"), href: "#gallery" },
    { label: t("header.nav_contact"), href: "#contact" },
  ];

  /* ── Track scroll for header state ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Body scroll lock when mobile menu is open ── */
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [menuOpen]);

  /* ── Smooth scroll handler ── */
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      scrollToElement(href);
      setMenuOpen(false);
    },
    [],
  );

  /* ── Close mobile menu on resize to desktop ── */
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── Close mobile menu on Escape key ── */
  useEffect(() => {
    if (!menuOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [menuOpen]);

  return (
    <>
      <header
        id="header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled ? "header-scrolled" : "header-at-top"
        }`}
      >
        {/* ════ Desktop Header — Single bar ════ */}
        <div className="hidden lg:block">
          <div className="hdr-desktop-bar max-w-[1440px] mx-auto px-10 xl:px-14">
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center h-[88px]">

              {/* ════ Right — Logo ════ */}
              <div className="flex justify-start">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hdr-logo-frame group"
                >
                  <img
                    src="/images/imaz-logo-new.svg"
                    alt="ایماز"
                    className="h-16 xl:h-[66px] w-auto transition-all duration-500 group-hover:scale-105"
                  />
                </a>
              </div>

              {/* ════ Center — Nav ════ */}
              <nav className="hdr-nav-links">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="nav-luxury-link"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* ════ Left — Lang + Phone + CTA ════ */}
              <div className="flex items-center justify-end gap-3 xl:gap-4">
                <div className="hdr-lang">
                  <LanguageSwitcher />
                </div>

                <a
                  href="tel:+982537401065"
                  className="hdr-phone-link flex items-center gap-1.5 font-[family-name:var(--font-vazirmatn)]"
                >
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">۰۲۵۳۷۴۰۱۰۶۵</span>
                </a>

                  <a
                    href="#booking"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToElement("#booking");
                    }}
                    className="hdr-cta-pill btn-cta inline-flex items-center text-white font-bold text-[14px] gap-2.5"
                  >
                    <Calendar className="w-[18px] h-[18px]" />
                    <span>{t("header.book_now")}</span>
                    <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
                  </a>
              </div>
            </div>
          </div>
        </div>

        {/* ════ Mobile Header ════ */}
        <div className="lg:hidden">
          <div className="flex items-center px-5 sm:px-8 max-w-[1440px] mx-auto h-[80px]">
            <div className="w-full flex items-center justify-between gap-3">
              {/* Logo */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center shrink-0 transition-all duration-300 group z-50"
              >
                <img
                  src="/images/imaz-logo-new.svg"
                  alt="ایماز"
                  className="h-16 sm:h-[72px] w-auto transition-all duration-300 group-hover:brightness-110"
                />
              </a>

              {/* Mobile actions */}
              <div className="flex items-center gap-2 z-50">
                <a
                  href="#booking"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement("#booking");
                  }}
                  className="btn-cta hdr-cta-mobile inline-flex items-center text-white font-bold px-3 sm:px-5 py-2 text-[12px] sm:text-[13px] gap-1.5 sm:gap-2 min-w-0"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t("header.book_now")}</span>
                </a>

                <button
                  ref={buttonRef}
                  className="hdr-hamburger w-10 h-10 flex items-center justify-center rounded-xl text-[#0D3A35] transition-colors duration-300 relative z-[60]"
                  aria-label={t("header.menu_aria")}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <div className="relative w-5 h-5 flex flex-col justify-center items-center gap-[5px]">
                    <span
                      className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                        menuOpen ? "rotate-45 translate-y-[7px]" : ""
                      }`}
                      style={{ backgroundColor: menuOpen ? "#1B7A6E" : "#0D3A35" }}
                    />
                    <span
                      className={`block w-5 h-[2px] rounded-full transition-all duration-300 ${
                        menuOpen ? "opacity-0 scale-0" : ""
                      }`}
                      style={{ backgroundColor: menuOpen ? "#1B7A6E" : "#0D3A35" }}
                    />
                    <span
                      className={`block w-5 h-[2px] rounded-full transition-all duration-300 origin-center ${
                        menuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                      }`}
                      style={{ backgroundColor: menuOpen ? "#1B7A6E" : "#0D3A35" }}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════ Mobile Dropdown Menu ════ */}
      <div
        ref={menuRef}
        className={`lg:hidden fixed left-0 right-0 z-[55] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          menuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        style={{
          top: menuOpen ? "80px" : "68px",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: menuOpen
            ? "0 24px 64px rgba(27,122,110,0.10), 0 4px 16px rgba(0,0,0,0.04)"
            : "none",
          borderBottom: menuOpen ? "1px solid rgba(27,122,110,0.06)" : "1px solid transparent",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(27,122,110,0.12), transparent)" }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5">
          <div className="space-y-0.5">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all duration-300 text-start text-[#0D3A35]/65 hover:text-[#0D3A35] hover:bg-[rgba(27,122,110,0.05)]"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateY(0)" : "translateY(-10px)",
                  transition: `opacity 0.3s ease ${index * 60}ms, transform 0.3s ease ${index * 60}ms`,
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="my-4 mx-2">
            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(27,122,110,0.10), transparent)" }} />
          </div>

          <div className="flex items-center justify-between px-3">
            <LanguageSwitcher />
            <a
              href="tel:+982537401065"
              className="flex items-center gap-2 font-medium text-sm transition-colors duration-300 text-teal-600 hover:text-teal-800 font-[family-name:var(--font-vazirmatn)]"
            >
              <Phone className="w-4 h-4" />
              <span dir="ltr">۰۲۵۳۷۴۰۱۰۶۵</span>
            </a>
          </div>

          <div className="mt-4 px-2 pb-1">
            <a
              href="#booking"
              onClick={(e) => {
                e.preventDefault();
                scrollToElement("#booking");
                setMenuOpen(false);
              }}
              className="btn-cta hdr-cta-pill flex items-center justify-center gap-2.5 w-full px-6 py-3.5 text-white font-bold text-[15px]"
            >
              <Calendar className="w-[18px] h-[18px]" />
              {t("header.book_consultation")}
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </a>
          </div>
        </div>
      </div>

      {/* ════ Mobile Menu Backdrop ════ */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[45] lg:hidden"
          style={{ background: "rgba(13,58,53,0.12)" }}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
