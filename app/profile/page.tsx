"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProfileDashboard from "@/components/scenes/ProfileDashboard";
import VibrantAurora from "@/components/ui/VibrantAurora";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

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
        if (!d.profile) {
          router.replace("/");
          return;
        }
        setProfile(d.profile as Profile);
      })
      .catch(() => !cancelled && router.replace("/"));
    return () => {
      cancelled = true;
    };
  }, [status, router]);

  if (!profile) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-canvas">
        <div className="animate-pulse text-3xl">🌊</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-canvas">
      <VibrantAurora intensity={0.8} />
      <ProfileDashboard profile={profile} onBack={() => router.push("/")} />
    </main>
  );
}
