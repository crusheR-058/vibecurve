"use client";

import { MotionConfig } from "framer-motion";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/Toast";

/**
 * Global client providers. MotionConfig reducedMotion="user" makes every
 * Framer Motion animation honor the OS "reduce motion" setting automatically.
 * SessionProvider exposes the Google session via useSession() app-wide.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MotionConfig reducedMotion="user">
        {children}
        <Toaster />
      </MotionConfig>
    </SessionProvider>
  );
}
