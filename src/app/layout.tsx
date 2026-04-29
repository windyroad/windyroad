import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/src/components-next/Header';
import Footer from '@/src/components-next/Footer';
import Clarity from '@/src/components-next/Clarity';
import {
  FullyBookedStatus,
  FullyBookedStatusProvider,
} from '@/src/components-next/FullyBookedStatus';
import '../styles/globals.scss';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'optional',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Windy Road Technology | Patch Fitness for Engineering Teams',
  description:
    'AI-powered vulnerability discovery is measured in hours. Your patch cycle isn\u2019t. We help engineering teams get patch fit.',
  keywords:
    'patch fitness, dependency management, vulnerability patching, continuous patching, CI/CD, software supply chain',
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
        <FullyBookedStatusProvider>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <FullyBookedStatus />
        </FullyBookedStatusProvider>
      </body>
    </html>
  );
}
