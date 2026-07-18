"use client";

// Next
import { Nunito } from "next/font/google";
// Components
import { NavBar } from "@/components";
// Services
import { MapProvider, ThemeProvider } from "@/services";
// Styles
import "@/styles/global.css";

const nunito = Nunito({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // ThemeProvider has to sit inside <body>: it injects a <script>, and a
    // script as a direct child of <html> is invalid HTML that breaks hydration.
    // suppressHydrationWarning covers the class/style next-themes puts on <html>.
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`w-full flex flex-col ${nunito.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <NavBar />
          <div className="min-h-0 grow">
            <MapProvider>{children}</MapProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
