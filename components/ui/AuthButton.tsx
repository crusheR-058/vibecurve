"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { getEmoji } from "@/lib/session";

const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * Google sign-in / account chip. Renders nothing until auth is configured
 * (NEXT_PUBLIC_AUTH_ENABLED=true), so the app is unchanged before credentials.
 */
export default function AuthButton({ className = "" }: { className?: string }) {
  const { data: session, status } = useSession();
  // Anonymous handle = the same emoji peers see in rooms. Read on the client
  // (localStorage) after mount to avoid a hydration mismatch.
  const [handle, setHandle] = useState("🌙");
  useEffect(() => setHandle(getEmoji()), [session?.user?.email]);
  if (!AUTH_ENABLED) return null;

  if (status === "loading") {
    return <div className={`h-9 w-24 animate-pulse rounded-button bg-card/60 ${className}`} />;
  }

  return (
    <AnimatePresence mode="wait">
      {session?.user ? (
        <motion.div
          key="account"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 ${className}`}
        >
          <Link
            href="/profile"
            title="Your anonymous profile"
            className="flex items-center gap-2 rounded-button border border-hair bg-card/70 py-1.5 pl-1.5 pr-3 text-sm text-ink transition hover:bg-card"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent-light text-sm">
              {handle}
            </span>
            <span className="max-w-[120px] truncate">Anonymous</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="text-xs text-muted transition hover:text-ink"
          >
            Sign out
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="signin"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google")}
          className={`flex items-center gap-2 rounded-button border border-hair bg-card px-4 py-2 text-sm font-medium text-ink shadow-soft transition hover:shadow-lift ${className}`}
        >
          <GoogleMark />
          Continue with Google
        </motion.button>
      )}
    </AnimatePresence>
  );
}
