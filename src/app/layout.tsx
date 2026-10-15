import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Italiana, Jost } from "next/font/google";
import { CartDrawer } from "@/app/components/cart/CartDrawer";
import { Footer } from "@/app/components/layout/Footer";
import { Navbar } from "@/app/components/layout/Navbar";
import { MotionProvider } from "@/app/components/motion/MotionProvider";
import { getSiteUrl } from "@/app/lib/env";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  organizationJsonLd,
  serializeJsonLd,
  websiteJsonLd,
} from "@/app/lib/seo";
import { CartProvider } from "@/app/providers/CartProvider";
import "./globals.css";

/** Thin, high-contrast display face for the wordmark and hero headlines. */
const wordmark = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-wordmark",
  display: "swap",
});

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});

const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Luxury Skincare, Considered`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["luxury skincare", "serum", "moisturiser", "clean beauty", "Maison Aura"],
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#faf6f0",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${wordmark.variable} ${heading.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-burgundy-700 px-5 py-3 text-porcelain focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <CartProvider>
            <Navbar />
            <main id="main" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd([organizationJsonLd(), websiteJsonLd()]),
          }}
        />
      </body>
    </html>
  );
}
