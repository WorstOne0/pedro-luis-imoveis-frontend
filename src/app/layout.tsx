// Next
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
// Components
import Providers from "./providers";
// Styles
import "@/styles/global.css";

// Poppins has no variable font on Google Fonts, so the weights actually used
// have to be listed explicitly.
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pedroluisimoveis.com.br";

// This file is a server component on purpose: metadata cannot be exported from
// a "use client" module, and without it the site had no <title> at all.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pedro Luis Imóveis · Casas e apartamentos em Cascavel/PR",
    template: "%s · Pedro Luis Imóveis",
  },
  description:
    "Encontre casas, apartamentos, sobrados, terrenos e salas comerciais à venda em Cascavel/PR. Busque no mapa por bairro, preço e área.",
  applicationName: "Pedro Luis Imóveis",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Pedro Luis Imóveis",
    title: "Pedro Luis Imóveis · Casas e apartamentos em Cascavel/PR",
    description: "Imóveis à venda em Cascavel/PR. Busque no mapa por bairro, preço e área.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning covers the class/style next-themes puts on <html>.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`w-full flex flex-col ${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
