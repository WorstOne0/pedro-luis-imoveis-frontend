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
    <html lang="en">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <body className={`w-full flex flex-col ${nunito.className} antialiased`}>
          <NavBar />
          <div className="min-h-0 grow">
            <MapProvider>{children}</MapProvider>
          </div>
        </body>
      </ThemeProvider>
    </html>
  );
}
