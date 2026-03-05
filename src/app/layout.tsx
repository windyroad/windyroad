import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/src/components-next/Header';
import Footer from '@/src/components-next/Footer';
import Clarity from '@/src/components-next/Clarity';
import '../styles/globals.scss';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'optional',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tom Howard | AI Delivery Consulting',
  description:
    'Ship with AI without the risk. 25+ years of delivery, quality, and risk expertise helping founders and engineering leaders deliver with AI safely.',
  keywords:
    'AI consulting, software delivery, CI/CD, quality gates, risk management, fractional engineering leader',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Clarity projectId="vpxikrum5k" />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
