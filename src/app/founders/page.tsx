import type { Metadata } from 'next';
import Hero from '@/src/components-next/Hero';
import OperatorSection from '@/src/components-next/OperatorSection';
import ApproachSection from '@/src/components-next/ApproachSection';
import PricingSection from '@/src/components-next/PricingSection';
import ObjectionBlock from '@/src/components-next/ObjectionBlock';
import TestimonialsSection from '@/src/components-next/TestimonialsSection';
import FitCheckSection from '@/src/components-next/FitCheckSection';
import FAQSection from '@/src/components-next/FAQSection';
import CTASection from '@/src/components-next/CTASection';

export const metadata: Metadata = {
  title: 'Founders | Fix Your Vibe-Coded App | Windy Road Technology',
  description:
    'Your vibe-coded app is in production and something keeps breaking. I make sure it works. 25+ years of delivery expertise.',
};

export default function FoundersPage() {
  return (
    <>
      <Hero />
      <OperatorSection />
      <ApproachSection />
      <PricingSection />
      <ObjectionBlock />
      <TestimonialsSection />
      <FitCheckSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
