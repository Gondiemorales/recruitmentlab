import { Hero } from "@/components/marketing/home/hero";
import { Logos } from "@/components/marketing/home/logos";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { Features } from "@/components/marketing/home/features";
import { Comparison } from "@/components/marketing/home/comparison";
import { Stats } from "@/components/marketing/home/stats";
import { Testimonials } from "@/components/marketing/home/testimonials";
import { Sectors } from "@/components/marketing/home/sectors";
import { Faq } from "@/components/marketing/home/faq";
import { ContactSection } from "@/components/marketing/home/contact-section";
import { Cta } from "@/components/marketing/home/cta";

/** Landing B2B: web para empresas que necesitan contratar */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Logos />
      <Sectors />
      <HowItWorks />
      <Features />
      <Comparison />
      <Stats />
      <Testimonials />
      <Faq />
      <Cta />
      <ContactSection />
    </>
  );
}
