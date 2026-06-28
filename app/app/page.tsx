"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Aurora from "@/components/ui/Aurora";
import CursorGlow from "@/components/ui/CursorGlow";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthButton from "@/components/ui/AuthButton";
import DrawYourDay from "@/components/scenes/DrawYourDay";
import Matching from "@/components/scenes/Matching";
import ParallelRoom from "@/components/scenes/ParallelRoom";
import MidnightBurn from "@/components/scenes/MidnightBurn";
import Walkthrough from "@/components/scenes/Walkthrough";
import { toast } from "@/components/ui/Toast";
import {
  getEmoji,
  getUserId,
  pickEmoji,
  rememberCurve,
  rememberMatch,
  setEmoji,
} from "@/lib/session";
import type { CurvePoints, MatchResult, Profile } from "@/lib/types";

// VibeCheck = the curve experience only. Login + walkthrough happen at "/",
// so here we guard (signed in + onboarded) then draw → match → room → burn.
// When the night burns, we re-open the flashcards for fresh interests and
// rotate the anonymous emoji handle — every session starts clean & nameless.
type Scene = "loading" | "draw" | "matching" | "room" | "burn" | "refresh";

export default function VibeCheckPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [scene, setScene] = useState<Scene>("loading");
  const [points, setPoints] = useState<CurvePoints>([5, 5, 5, 5, 5]);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const userId = session?.user?.email ?? getUserId();

  // guard: signed-in AND has a profile, else back to the entry funnel at "/"
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (!d.profile || !d.profile.domains?.length) {
          router.replace("/");
          return;
        }
        setProfile(d.profile as Profile);
        setScene((s) => (s === "loading" ? "draw" : s));
      })
      .catch(() => !cancelled && router.replace("/"));
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  const submitCurve = useCallback(
    async (pts: CurvePoints) => {
      setPoints(pts);
      rememberCurve(pts);
      setReady(false);
      setMatch(null);
      setScene("matching");
      try {
        const res = await fetch("/api/curve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, emoji: getEmoji(), points: pts }),
        });
        const data: MatchResult = await res.json();
        setMatch(data);
        rememberMatch(data.roomId, data.matchPercent);
      } catch {
        setMatch({
          roomId: "",
          matchPercent: 86,
          signature: "",
          you: { userId, emoji: getEmoji(), joinedAt: Date.now() },
        });
      } finally {
        setReady(true);
      }
    },
    [userId],
  );

  // stable so Matching's reveal timer isn't reset by unrelated parent re-renders
  const handleResolved = useCallback(() => {
    setScene("room");
    toast("You found your parallel — say hi", "🫂");
  }, []);

  const immersive = scene === "room" || scene === "burn";
  const showBar = scene === "draw" || scene === "matching";

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-canvas">
      {!immersive && <Aurora intensity={0.7} />}
      <CursorGlow />

      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5"
          >
            <Link href="/" aria-label="home">
              <Logo />
            </Link>
            <div className="flex items-center gap-3">
              <AuthButton />
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {scene === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid min-h-[100dvh] place-items-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="text-3xl"
              >
                🌊
              </motion.div>
            </motion.div>
          )}

          {scene === "draw" && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid min-h-[100dvh] place-items-center py-24"
            >
              <DrawYourDay onSubmit={submitCurve} />
            </motion.div>
          )}

          {scene === "matching" && (
            <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Matching
                points={points}
                ready={ready}
                resolvedPercent={match?.matchPercent ?? null}
                onResolved={handleResolved}
              />
            </motion.div>
          )}

          {scene === "room" && match && (
            <motion.div key="room" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <ParallelRoom
                roomId={match.roomId}
                userId={userId}
                emoji={getEmoji()}
                matchPercent={match.matchPercent}
                onBurn={() => setScene("burn")}
              />
            </motion.div>
          )}

          {scene === "refresh" && profile && (
            <motion.div key="refresh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Walkthrough
                mode="interests"
                initialWords={profile.words}
                initialDescribe={profile.describe}
                onComplete={(p) => {
                  setProfile(p);
                  setScene("draw");
                  toast("New interests saved — draw tonight's curve.", "✨");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {scene === "burn" && (
          <MidnightBurn
            onComplete={() => {
              setMatch(null);
              setEmoji(pickEmoji()); // rotate to a fresh anonymous handle each night
              if (profile) {
                setScene("refresh");
                toast("The night burned away — pick fresh interests.", "🌅");
              } else {
                setScene("draw");
                toast("The night is gone. Draw again whenever you're ready.", "🌅");
              }
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
