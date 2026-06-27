"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthButton from "@/components/ui/AuthButton";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why" },
  { href: "#privacy", label: "Privacy" },
  { href: "#faq", label: "FAQ" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-sheet px-5 py-3 transition-all duration-300 ${
          scrolled ? "glass mx-4 border border-hair shadow-soft" : "bg-transparent"
        }`}
      >
        <Link href="/" aria-label="VibeCurve home">
          <Logo />
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthButton />
          </div>
          <ThemeToggle />
          <Link
            href="/app"
            className="rounded-button bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-transform hover:scale-[1.03] active:scale-95"
          >
            VibeCheck
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
