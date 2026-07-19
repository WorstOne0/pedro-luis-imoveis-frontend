/* eslint-disable @next/next/no-img-element */
"use client";

// Next
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
// Icons
import { MdMenu, MdClose } from "react-icons/md";
import { FaRegMoon, FaRegSun } from "react-icons/fa6";
//
import logo from "@/../public/logo/logo.png";

const ROUTES = [
  { value: "/", name: "Home" },
  { value: "/about", name: "Sobre" },
  { value: "/contact", name: "Contato" },
];

/** Animated knob toggle, matching the mockup rather than a bare icon button. */
function ThemeToggle({ isDark, isMounted, onToggle }: { isDark: boolean; isMounted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={!isMounted ? "Alternar tema" : isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      onClick={onToggle}
      className={`relative h-[3.4rem] w-[6rem] shrink-0 rounded-full border transition-colors cursor-pointer
        ${isDark ? "bg-primary border-primary" : "bg-gray-200 border-gray-300"}`}
    >
      <span
        className={`absolute top-[0.25rem] h-[2.6rem] w-[2.6rem] rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300
          ${isDark ? "translate-x-[2.9rem]" : "translate-x-[0.25rem]"}`}
      >
        {isMounted && (isDark ? <FaRegMoon size={12} className="text-primary" /> : <FaRegSun size={12} className="text-amber-500" />)}
      </span>
    </button>
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // next-themes only knows the real theme after hydration; rendering the icon
  // before that mismatches the server output. A mount flag is the documented
  // workaround and necessarily runs in an effect.
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsMounted(true), []);

  const isDark = isMounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    // Floating: taken out of flow so the map and the listing page render
    // underneath it. Translucent + blurred so content is visibly passing behind
    // rather than hitting a solid bar.
    <header className="fixed top-0 left-0 right-0 z-50 w-full px-[1.5rem] pt-[1.5rem] pointer-events-none">
      {/* /95, not /80: over the map the extra transparency let the tiles bleed
          through and the bar read as a grey wash rather than a surface. */}
      <nav className="w-full flex items-center justify-between gap-[2rem] bg-background/95 backdrop-blur-xl border border-border rounded-[1.4rem] shadow-lg px-[2rem] py-[1.2rem] pointer-events-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[1rem] shrink-0 select-none">
          <img src={logo.src} alt="Pedro Luis Imóveis" className="h-[3.4rem] w-[3.4rem] object-contain" />
          <span className="hidden sm:flex items-baseline text-[1.9rem] tracking-tight">
            <span className="font-extrabold text-primary">Pedro Luis</span>
            <span className="font-light ml-[0.5rem] text-gray-500 dark:text-gray-400">Imóveis</span>
          </span>
        </Link>

        {/* Everything else sits together on the right: the links used to float
            in the middle, detached from the actions they belong with. */}
        <div className="flex items-center gap-[2rem] shrink-0">
          {/* Desktop nav — pills, active one filled */}
          <div className="hidden md:flex items-center gap-[0.4rem]">
            {ROUTES.map((route) => {
              const isActive = pathname === route.value;

              return (
                <Link
                  key={route.value}
                  href={route.value}
                  className={`px-[2rem] py-[0.8rem] rounded-full text-[1.5rem] font-semibold transition-colors
                    ${isActive ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  {route.name}
                </Link>
              );
            })}
          </div>

          <span className="hidden md:block h-[2.4rem] w-px bg-border" />

          <div className="flex items-center gap-[1rem]">
            <ThemeToggle isDark={isDark} isMounted={isMounted} onToggle={toggleTheme} />

            <button
              type="button"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="flex md:hidden h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border border-border cursor-pointer"
            >
              {isMenuOpen ? <MdClose size={20} /> : <MdMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden w-full flex flex-col bg-background/95 backdrop-blur-xl border border-border rounded-[1.4rem] shadow-lg mt-[0.8rem] p-[0.8rem] pointer-events-auto">
          {ROUTES.map((route) => (
            <Link
              key={route.value}
              href={route.value}
              onClick={() => setIsMenuOpen(false)}
              className={`px-[1.6rem] py-[1.2rem] rounded-[1rem] text-[1.5rem] font-semibold
                ${pathname === route.value ? "bg-primary text-white" : "text-gray-600 dark:text-gray-300"}`}
            >
              {route.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
