"use client";

// Components
import { NavBar } from "@/components";
// Services
import { MapProvider, ThemeProvider } from "@/services";

/**
 * Every client-only provider lives here so the root layout can stay a server
 * component. A "use client" layout cannot export `metadata`, which is why the
 * site shipped with an empty <title> and no description.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <NavBar />
      {/* The navbar is fixed, so it contributes no height here — this fills the
          viewport and pages render underneath it. */}
      <div className="h-full">
        <MapProvider>{children}</MapProvider>
      </div>
    </ThemeProvider>
  );
}
