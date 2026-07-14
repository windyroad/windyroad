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
  title: 'Windy Road Technology',
  description:
    'The Shift is our weekly read on AI engineering for engineering leaders, plus a blog on building software under AI disruption, from Windy Road Technology.',
  keywords:
    'AI engineering, The Shift, newsletter, engineering leadership, blog, Tom Howard, Windy Road Technology',
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
