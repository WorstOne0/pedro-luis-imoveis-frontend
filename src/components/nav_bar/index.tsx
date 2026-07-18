"use client";

// Next
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
// Icons
import { MdOutlineDarkMode, MdOutlineLightMode, MdMenu, MdClose } from "react-icons/md";

const ROUTES = [
  { value: "/", name: "Home" },
  { value: "/about", name: "Sobre" },
  { value: "/contact", name: "Contato" },
];

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

  // Before hydration the resolved theme is unknown, so both the icon and the
  // label have to stay neutral or the server and client markup disagree.
  const isDark = isMounted && resolvedTheme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const themeLabel = !isMounted ? "Alternar tema" : isDark ? "Ativar modo claro" : "Ativar modo escuro";

  const linkClass = (route: string) =>
    `px-3 cursor-pointer select-none font-bold ${pathname === route ? "text-primary dark:text-white" : "text-gray-500 dark:text-gray-400"}`;

  return (
    <nav className="min-h-[6.2rem] w-full bg-background flex items-center justify-between px-[2rem] md:px-[4rem] border-b-2 border-gray-200 dark:border-gray-700 relative">
      {/* Wordmark — swap for the real logo asset once it exists */}
      <Link href="/" className="flex items-baseline select-none">
        <span className="text-[2.2rem] font-extrabold tracking-tight text-primary">Pedro Luis</span>
        <span className="text-[2.2rem] font-light ml-2 text-gray-600 dark:text-gray-300">Imóveis</span>
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center">
        <div className="flex items-center mr-[4rem]">
          {ROUTES.map((route) => (
            <div key={route.value} className="mr-[4rem] last:mr-0">
              <Link href={route.value} className={linkClass(route.value)}>
                {route.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="h-[4rem] border-l-2 border-gray-200 dark:border-gray-700 mr-[3rem]" />

        <button type="button" aria-label={themeLabel} onClick={toggleTheme} className="cursor-pointer">
          {isMounted && (isDark ? <MdOutlineLightMode size={26} /> : <MdOutlineDarkMode size={26} />)}
        </button>
      </div>

      {/* Mobile toggle */}
      <div className="flex md:hidden items-center gap-[1.5rem]">
        <button type="button" aria-label={themeLabel} onClick={toggleTheme} className="cursor-pointer">
          {isMounted && (isDark ? <MdOutlineLightMode size={24} /> : <MdOutlineDarkMode size={24} />)}
        </button>
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="cursor-pointer"
        >
          {isMenuOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b-2 border-gray-200 dark:border-gray-700 flex flex-col py-[1rem] z-50">
          {ROUTES.map((route) => (
            <Link
              key={route.value}
              href={route.value}
              onClick={() => setIsMenuOpen(false)}
              className={`${linkClass(route.value)} py-[1.2rem] px-[2rem]`}
            >
              {route.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
