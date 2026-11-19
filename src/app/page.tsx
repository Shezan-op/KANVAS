import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { Hero, Nav } from "@/components/landing/Hero";
import { PlatformMarquee, TemplateGallery } from "@/components/landing/Gallery";
import { Philosophy, Capabilities, DeveloperSpotlight, AgentBand, Faq, FinalCta, Footer } from "@/components/landing/Sections";

export const metadata = {
  title: "KANVAS — Spatial Visual Carousel Studio by LeadLinked & Shezan",
  description: "Next-generation, offline-first carousel and presentation studio engineered by LeadLinked & Shezan with visionOS spatial glass craftsmanship.",
};

export default function Landing() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="overflow-x-clip bg-bg text-ink">
        <Hero />
        <PlatformMarquee />
        <Philosophy />
        <TemplateGallery />
        <Capabilities />
        <DeveloperSpotlight />
        <AgentBand />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
