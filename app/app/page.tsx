"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Aurora from "@/components/ui/Aurora";
import CursorGlow from "@/components/ui/CursorGlow";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthButton from "@/components/ui/AuthButton";
import Login from "@/components/scenes/Login";
import Walkthrough from "@/components/scenes/Walkthrough";
import VibeCheckHome from "@/components/scenes/VibeCheckHome";
import ProfileDashboard from "@/components/scenes/ProfileDashboard";
import DrawYourDay from "@/components/scenes/DrawYourDay";
import Matching from "@/components/scenes/Matching";
import ParallelRoom from "@/components/scenes/ParallelRoom";
import MidnightBurn from "@/components/scenes/MidnightBurn";
import { toast } from "@/components/ui/Toast";
import { getEmoji, getUserId, rememberCurve, rememberMatch } from "@/lib/session";
import type { CurvePoints, MatchResult, Profile } from "@/lib/types";

type Scene =
  | "loading"
  | "login"
  | "walkthrough"
  | "home"
  | "draw"
  | "matching"
  | "room"
  | "burn"
  | "profile";

const GATING: Scene[] = ["loading", "login", "walkthrough"];

export default function ExperiencePage() {
  const { data: session, status } = useSession();
  const [scene, setScene] = useState<Scene>("loading");
  // undefined = not fetched yet · null = no profile · Profile = loaded
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  const [points, setPoints] = useState<CurvePoints>([5, 5, 5, 5, 5]);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [ready, setReady] = useState(false);

  const userId = session?.user?.email ?? getUserId();

  // fetch (or reset) the permanent profile as auth state changes
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

  // gate: loading → login → walkthrough → app. Don't clobber the user once
  // they're navigating inside the app.
  useEffect(() => {
    if (status === "loading") return setScene("loading");
    if (status === "unauthenticated") return setScene("login");
    if (profile === undefined) return setScene("loading");
    if (profile === null) return setScene("walkthrough");
    setScene((s) => (GATING.includes(s) ? "home" : s));
  }, [status, profile]);

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

  const immersive = scene === "room" || scene === "burn";
  const showBar = ["home", "draw", "matching", "profile"].includes(scene);

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

          {scene === "login" && (
            <motion.div key="login" exit={{ opacity: 0 }}>
              <Login />
            </motion.div>
          )}

          {scene === "walkthrough" && (
            <motion.div key="walkthrough" exit={{ opacity: 0 }}>
              <Walkthrough onComplete={(p) => setProfile(p)} />
            </motion.div>
          )}

          {scene === "home" && profile && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <VibeCheckHome
                profile={profile}
                name={session?.user?.name}
                onStart={() => setScene("draw")}
                onProfile={() => setScene("profile")}
              />
            </motion.div>
          )}

          {scene === "profile" && profile && (
            <motion.div key="profile" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProfileDashboard
                profile={profile}
                name={session?.user?.name}
                onBack={() => setScene("home")}
              />
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
                onResolved={() => {
                  setScene("room");
                  toast("You found your parallel — say hi", "🫂");
                }}
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
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {scene === "burn" && (
          <MidnightBurn
            onComplete={() => {
              setMatch(null);
              setScene("home");
              toast("The night is gone. Your profile stays — your VibeCheck refreshes.", "🌅");
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
