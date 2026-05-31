import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SWRegister } from "@/components/sw-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchDay - Agende seu futebol",
  description: "Marque seu futebol, divida o pagamento e jogue sem preocupação. Encontre campos perto de você, reserve horários e pague via PIX.",
  manifest: "/manifest.webmanifest",
  keywords: ["futebol", "campo de futebol", "reserva de campo", "pelada", "futebol society", "MatchDay"],
  openGraph: {
    title: "MatchDay - Agende seu futebol",
    description: "Marque seu futebol, divida o pagamento e jogue sem preocupação.",
    type: "website",
    locale: "pt_BR",
    siteName: "MatchDay",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MatchDay",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg">
          Pular para conteúdo principal
        </a>
        <Providers>{children}</Providers>
        <SWRegister />
      </body>
    </html>
  );
}
