"use client";

import { useEffect } from "react";
import ScrollProgress from "@/components/lumina/ScrollProgress";
import Header from "@/components/lumina/Header";
import Hero from "@/components/lumina/Hero";
import About from "@/components/lumina/About";
import WhyImaz from "@/components/lumina/WhyImaz";
import Services from "@/components/lumina/Services";
import Gallery from "@/components/lumina/Gallery";
import Collaborations from "@/components/lumina/Collaborations";
import FAQ from "@/components/lumina/FAQ";
import Booking from "@/components/lumina/Booking";
import Footer from "@/components/lumina/Footer";
import MobileStickyCta from "@/components/lumina/MobileStickyCta";
import BackToTop from "@/components/lumina/BackToTop";
import BackgroundMusic from "@/components/lumina/BackgroundMusic";
import WaveDivider from "@/components/lumina/WaveDivider";
import SocialFloating from "@/components/lumina/SocialFloating";

export default function Home() {
  // Prevent auto-scroll on page load (e.g., browser restoring scroll position)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="main-site" className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Header />
      <main className="flex-1">
        <Hero />
        <About />
        {/* Water wave animation: white → dark WhyImaz */}
        <WaveDivider fromColor="#FFFFFF" toColor="#0D3A35" variant={5} accentColor="#6BCDB8" />
        <WhyImaz />
        <Services />
        {/* Water wave animation: light services → white Gallery */}
        <WaveDivider fromColor="#F0FAF8" toColor="#FFFFFF" variant={5} accentColor="#2DA89E" />
        <Gallery />
        <Collaborations />
        <WaveDivider fromColor="#F9F6EF" toColor="#FAFCFB" variant={2} />
        <FAQ />
        <WaveDivider fromColor="#FAFCFB" toColor="#092824" variant={1} />
        <Booking />
        <WaveDivider fromColor="#0D3A35" toColor="#1F2B3D" variant={5} accentColor="#2DA89E" />
      </main>
      <Footer />
      <SocialFloating />
      <MobileStickyCta />
      <BackgroundMusic />
      <BackToTop />
    </div>
  );
}
