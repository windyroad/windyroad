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
  title: 'Tom Howard | AI Delivery Consulting for Engineering Teams',
  description:
    'Your team adopted Copilot, Cursor, or Claude. I partner with engineering leaders to make sure the speed doesn\u2019t come at the cost of quality.',
  keywords:
    'AI consulting, engineering teams, AI code quality, CI/CD guardrails, code review, fractional delivery lead',
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
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
