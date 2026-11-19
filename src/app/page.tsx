import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { Hero, Nav } from "@/components/landing/Hero";
import { PlatformMarquee, TemplateGallery } from "@/components/landing/Gallery";
import { Bento } from "@/components/landing/Bento";
import { AgentBand, Faq, FinalCta, Footer, HowItWorks, Manifesto, Pricing, Stats, UseCases } from "@/components/landing/Sections";

export const metadata = {
  title: "KANVAS — Minimalist Visual Carousel Studio",
  description: "Bespoke, offline-first carousel creation suite built with Apple HIG and Steve Jobs minimalist craftsmanship.",
};

export default function Landing() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="overflow-x-clip bg-bg text-ink">
        <Hero />
        <PlatformMarquee />
        <Manifesto />
        <TemplateGallery />
        <Bento />
        <HowItWorks />
        <AgentBand />
        <Stats />
        <UseCases />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
