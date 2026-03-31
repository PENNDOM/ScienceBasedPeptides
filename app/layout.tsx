import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/nav-bar";
import { Footer } from "@/components/layout/footer";
import { NewsletterStrip } from "@/components/layout/newsletter-strip";
import { DecorativeVials } from "@/components/layout/decorative-vials";
import { AgeGate } from "@/components/ui/age-gate";
import { CookieConsent } from "@/components/cookie-consent";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ScrollToTop } from "@/components/providers/scroll-to-top";
import { MarketingTracker } from "@/components/providers/marketing-tracker";
import { siteMetadata } from "@/lib/seo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata();

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <AuthProvider>
          <MarketingTracker />
          <ScrollToTop />
          <AgeGate />
          <DecorativeVials />
          <NavBar />
          <main className="relative z-10 flex-1">{children}</main>
          <div className="relative z-10">
            <NewsletterStrip />
            <Footer />
            <CookieConsent />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
