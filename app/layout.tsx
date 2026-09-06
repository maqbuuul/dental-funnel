import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

const PRACTICE = process.env.NEXT_PUBLIC_PRACTICE_NAME ?? 'Bright Smile Dental';
const CITY = process.env.NEXT_PUBLIC_PRACTICE_CITY ?? 'Charlotte';
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  title: `New patient exam and X-rays for $59 · ${PRACTICE}`,
  description:
    `New patient exam and complete X-rays for $59 at ${PRACTICE}, ${CITY}. ` +
    `No lecture about how long it has been. Most PPO plans accepted.`,
};

// Most traffic here is a phone, from a Facebook in-app browser.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f3d34',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {PIXEL && (
          // PageView only. The Lead event fires from the form with a shared
          // event id so the browser pixel and the server-side CAPI call
          // deduplicate rather than double-counting the conversion.
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
            (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${PIXEL}');fbq('track','PageView');
          `}</Script>
        )}
      </body>
    </html>
  );
}
