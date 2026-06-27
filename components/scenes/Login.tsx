"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import AnimatedWave from "@/components/ui/AnimatedWave";
import FloatingParticles from "@/components/ui/FloatingParticles";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function Login() {
  return (
    <div className="relative grid min-h-[100dvh] place-items-center px-6">
      <FloatingParticles count={16} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <div className="mx-auto mb-8 h-28 w-64">
          <AnimatedWave width={260} height={110} className="h-full w-full" />
        </div>
        <h1 className="font-serif-display text-[34px] leading-[1.1] text-ink sm:text-[40px]">
          Before we begin,
          <br />
          <span className="italic text-accent">let&apos;s get to know you.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-[15px] leading-relaxed text-muted">
          Sign in once to build your VibeCurve profile. To everyone else you&apos;ll still be just
          an emoji — that part never changes.
        </p>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => signIn("google")}
          className="mx-auto mt-9 flex items-center gap-3 rounded-button border border-hair bg-card px-6 py-3.5 text-[15px] font-medium text-ink shadow-soft transition hover:shadow-lift"
        >
          <GoogleMark />
          Continue with Google
        </motion.button>
        <p className="mt-6 text-xs text-muted">
          No followers · no likes · no public profile · gone by midnight
        </p>
      </motion.div>
    </div>
  );
}
