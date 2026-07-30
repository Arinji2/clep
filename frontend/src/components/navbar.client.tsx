"use client";
import Link from "next/link";
import { useTheme } from "./theme-provider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-outline-variant/20 border-b bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-300 items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link
          href="/"
          className="font-black text-2xl text-primary tracking-tighter transition-opacity hover:opacity-80 md:text-4xl"
        >
          CLEP
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex cursor-pointer items-center justify-center rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
        >
          <span className="material-symbols-outlined text-[24px] md:text-[28px]">
            {theme === "light" ? "dark_mode" : "light_mode"}
          </span>
        </button>
      </div>
    </header>
  );
}
