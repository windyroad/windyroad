import Hero from '@/src/components-next/Hero';
import OperatorSection from '@/src/components-next/OperatorSection';
import ApproachSection from '@/src/components-next/ApproachSection';
import PricingSection from '@/src/components-next/PricingSection';
import TestimonialsSection from '@/src/components-next/TestimonialsSection';
import FitCheckSection from '@/src/components-next/FitCheckSection';
import FAQSection from '@/src/components-next/FAQSection';
import CTASection from '@/src/components-next/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <OperatorSection />
      <ApproachSection />
      <PricingSection />
      <TestimonialsSection />
      <FitCheckSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
