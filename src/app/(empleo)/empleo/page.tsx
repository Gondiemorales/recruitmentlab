import { EmpleoHero } from "@/components/empleo/empleo-hero";
import { CANDIDATE_FAQS, CandidateStories, FeaturedJobs, HowToApply, Promises, SectorsGrid, SendCvCta } from "@/components/empleo/empleo-sections";
import { Faq } from "@/components/marketing/home/faq";

/** Landing para candidatos */
export default function EmpleoPage() {
  return (
    <>
      <EmpleoHero />
      <SectorsGrid />
      <FeaturedJobs />
      <HowToApply />
      <Promises />
      <CandidateStories />
      <div id="preguntas" className="scroll-mt-24">
        <Faq items={CANDIDATE_FAQS} />
      </div>
      <SendCvCta />
    </>
  );
}
