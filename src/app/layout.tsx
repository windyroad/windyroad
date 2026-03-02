import type { Metadata } from 'next';
import Script from 'next/script';
import Header from '@/src/components-next/Header';
import Footer from '@/src/components-next/Footer';
import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/main.css';
import '../components-next/Header/index.css';
import '../components-next/post-link.scss';

export const metadata: Metadata = {
  title: 'Windy Road',
  description: 'Windy Road',
  keywords: 'consulting, IT, scrum, devops, agile, lean',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="landing is-loaded">
        <div id="page-wrapper">
          <Header />
          {children}
          <Footer />
        </div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=UA-808591-8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            if (document.location.hostname === 'windyroad.com.au') {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-808591-8');
            }
          `}
        </Script>
        <Script id="inspectlet" strategy="lazyOnload">
          {`
            if (document.location.hostname === 'windyroad.com.au') {
              window.__insp = window.__insp || [];
              window.__insp.push(['wid', 1654706623]);
              var insp = document.createElement('script');
              insp.type = 'text/javascript';
              insp.async = true;
              insp.id = 'inspsync';
              insp.src = 'https://cdn.inspectlet.com/inspectlet.js?wid=1654706623&r=' + Math.floor(new Date().getTime()/3600000);
              var x = document.getElementsByTagName('script')[0];
              x.parentNode.insertBefore(insp, x);
            }
          `}
        </Script>
      </body>
    </html>
  );
}
