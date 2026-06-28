"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Cursor from "@/components/immersive/Cursor";
import Loader from "@/components/immersive/Loader";
import SmoothScroll from "@/components/immersive/SmoothScroll";
import ImmersiveJourney from "@/components/immersive/ImmersiveJourney";
import Login from "@/components/scenes/Login";
import Walkthrough from "@/components/scenes/Walkthrough";
import type { Profile } from "@/lib/types";

// Site entry gate (unchanged): login → walkthrough → the immersive landing.
// Backend, routing, auth, APIs, and /app are all untouched.
export default function Home() {
  const { status } = useSession();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (status === "authenticated") {
      let cancelled = false;
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => !cancelled && setProfile(d.profile ?? null))
        .catch(() => !cancelled && setProfile(null));
      return () => {
        cancelled = true;
      };
    }
    if (status === "unauthenticated") setProfile(undefined);
  }, [status]);

  if (status === "loading" || (status === "authenticated" && profile === undefined)) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-canvas">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-3xl"
        >
          🌊
        </motion.div>
      </main>
    );
  }
  if (status === "unauthenticated") return <Login />;
  if (!profile || profile.domains.length === 0)
    return <Walkthrough onComplete={(p) => setProfile(p)} />;
  return <LandingHome />;
}

function LandingHome() {
  const router = useRouter();
  const go = () => router.push("/app");
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Cursor />
      <AnimatePresence>{!loaded && <Loader onDone={() => setLoaded(true)} />}</AnimatePresence>
      <SmoothScroll>
        <ImmersiveJourney onEnter={go} />
      </SmoothScroll>
    </>
  );
}
