import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Windy Road',
  description: 'Windy Road - Software Development & Consulting',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
