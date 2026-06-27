"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import Nav from "@/components/landing/Nav";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Aurora from "@/components/ui/Aurora";
import CursorGlow from "@/components/ui/CursorGlow";
import AnimatedWave from "@/components/ui/AnimatedWave";
import FloatingParticles from "@/components/ui/FloatingParticles";
import MagneticButton from "@/components/ui/MagneticButton";
import Reveal from "@/components/ui/Reveal";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Marquee from "@/components/ui/Marquee";
import CountUp from "@/components/ui/CountUp";
import TiltCard from "@/components/ui/TiltCard";

const HEADLINE_EASE = [0.22, 1, 0.36, 1] as const;

export default function Landing() {
  const router = useRouter();
  const go = () => router.push("/app");
  const reduce = useReducedMotion();

  // ── Hero scroll choreography ──────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -130]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.96]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // ── Hero cursor parallax ──────────────────────────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 20 });
  const smy = useSpring(my, { stiffness: 120, damping: 20 });
  const illTx = useTransform(smx, [-0.5, 0.5], [-22, 22]);
  const illTy = useTransform(smy, [-0.5, 0.5], [-14, 14]);
  const badgeTx = useTransform(smx, [-0.5, 0.5], [12, -12]);

  const onHeroMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <main className="relative overflow-hidden bg-canvas">
      <ScrollProgress />
      <CursorGlow />
      <Nav />

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={onHeroMove}
        className="relative grid min-h-[100dvh] place-items-center px-6 pt-24"
      >
        <motion.div style={{ y: auroraY }} className="absolute inset-0">
          <Aurora />
        </motion.div>
        <FloatingParticles count={16} />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div style={{ y: textY, scale: heroScale }} className="flex flex-col items-center">
            <motion.span
              style={{ x: badgeTx }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: HEADLINE_EASE }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-hair bg-card/70 px-4 py-1.5 text-xs text-muted backdrop-blur"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-peach" />
              The anti-flex network · gone by midnight
            </motion.span>

            {/* mask-reveal headline */}
            <h1 className="font-serif-display text-[clamp(40px,8vw,76px)] leading-[1.05] text-ink">
              {["Your day has a shape.", "Maybe someone else’s does too."].map((line, i) => (
                <span key={i} className="block overflow-hidden pb-1.5">
                  <motion.span
                    className={`block ${i === 1 ? "italic text-accent" : ""}`}
                    initial={{ y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, delay: 0.12 + i * 0.14, ease: HEADLINE_EASE }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <Reveal delay={0.4}>
              <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-muted">
                A quieter way to meet people who truly understand how today felt. Draw the curve of
                your day, match with people who felt it too, in rooms that vanish at midnight.
              </p>
            </Reveal>

            <Reveal delay={0.52}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <MagneticButton onClick={go}>
                  Draw My Day
                  <span aria-hidden>→</span>
                </MagneticButton>
                <MagneticButton
                  variant="ghost"
                  onClick={() =>
                    document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Watch Demo
                </MagneticButton>
              </div>
            </Reveal>
          </motion.div>

          {/* parallax illustration */}
          <motion.div style={{ y: waveY, x: illTx }} className="mt-16 w-full">
            <motion.div style={{ y: illTy }}>
              <Reveal delay={0.6} direction="scale">
                <div className="relative mx-auto max-w-2xl rounded-card border border-hair bg-card/80 p-6 shadow-lift backdrop-blur">
                  <AnimatedWave width={640} height={200} className="h-[180px] w-full" />
                  <div className="mt-3 flex justify-between px-2 text-xs text-muted">
                    <span>Morning</span>
                    <span>Afternoon</span>
                    <span>Evening</span>
                    <span>Night</span>
                  </div>
                </div>
              </Reveal>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-9 w-5 justify-center rounded-full border-2 border-muted/40 pt-1.5">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-muted/70"
              animate={{ y: [0, 7, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </section>

      {/* ───────────────────── Marquee strip ──────────────────── */}
      <div className="relative z-10 border-y border-hair bg-card/40 py-5 backdrop-blur">
        <Marquee
          items={[
            "presence over permanence",
            "connection over content",
            "honesty over perfection",
            "no likes",
            "no followers",
            "gone by midnight",
            "draw your day",
          ]}
        />
      </div>

      {/* ───────────────────── How it works ───────────────────── */}
      <Section id="how" eyebrow="How it works" title="Three honest steps. Then it's gone.">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Draw your day", d: "One continuous line from morning to night. No words to find, no face to perform.", icon: "〰️", dir: "left" as const },
            { n: "02", t: "Meet your parallel", d: "We find a few people whose day had the same shape and open a small, anonymous room.", icon: "🪞", dir: "up" as const },
            { n: "03", t: "Then it vanishes", d: "At midnight the room burns to ash. Nothing kept, nothing to scroll back through.", icon: "🌙", dir: "right" as const },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} direction={s.dir}>
              <TiltCard>
                <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-accent-light/60 text-2xl">
                  {s.icon}
                </div>
                <p className="text-xs font-medium tracking-widest text-accent">{s.n}</p>
                <h3 className="mt-1 font-serif-display text-2xl text-ink">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.d}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────────────────── Why VibeCurve ──────────────────── */}
      <Section id="why" eyebrow="Why VibeCurve" title="The human alternative to feeling alone.">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal direction="left">
            <p className="text-[19px] leading-relaxed text-muted">
              We&apos;re lonelier than ever, and the apps built to connect us mostly ask us to
              perform. VibeCurve does the opposite. No audience. No metrics. No algorithm pulling for
              your attention.
            </p>
            <p className="mt-5 text-[19px] leading-relaxed text-muted">
              Just a few real people, on a night that felt like yours, for as long as the night
              lasts. <span className="text-ink">Connection over content.</span>
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["9 hrs", "average teen daily media"],
              ["52%", "of Gen Z tried to quit social in 2025"],
              ["1 in 6", "people affected by loneliness"],
              ["80%", "still want real friendship"],
            ].map(([big, small], i) => (
              <Reveal key={small} delay={i * 0.08} direction="right">
                <div className="rounded-card border border-hair bg-card p-5 shadow-soft">
                  <div className="font-serif-display text-3xl text-accent">
                    <CountUp value={big} />
                  </div>
                  <div className="mt-1 text-sm text-muted">{small}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* ───────────────────── Privacy first ──────────────────── */}
      <section id="privacy" className="relative px-6 py-28">
        <Aurora intensity={0.5} />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              Privacy first
            </p>
            <h2 className="font-serif-display text-[clamp(32px,5vw,52px)] leading-tight text-ink">
              No followers. No likes.
              <br />
              No profiles. Only tonight.
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
              Everything you share is private from other users and erased at midnight. The database
              itself forgets — there&apos;s nothing to leak, nothing to scroll, nothing to regret.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────── Features ───────────────────────── */}
      <Section eyebrow="Features" title="Designed to feel calm, not addictive.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Draw-your-day canvas", "A tactile, three-second ritual. Expressive without being performative.", "✍️"],
            ["Vibe Match", "Matched by the shape of your day, not a curated highlight reel.", "🌊"],
            ["Parallel Rooms", "Small, synchronous, anonymous. Four or five people, emoji only.", "🫂"],
            ["Zero metrics", "No bios, photos, followers or likes. Nothing to compare.", "🕊️"],
            ["Midnight reset", "Rooms and messages auto-delete at midnight. Zero footprint.", "🌙"],
            ["No feed", "You draw, you connect, you leave. Nothing to doomscroll.", "🍃"],
          ].map(([t, d, icon], i) => (
            <Reveal key={t} delay={(i % 3) * 0.08} direction="scale">
              <TiltCard className="h-full">
                <div className="mb-4 text-2xl">{icon}</div>
                <h3 className="text-lg font-medium text-ink">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{d}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────────────────── Testimonials ───────────────────── */}
      <Section eyebrow="Quiet voices" title="What it feels like.">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["🌿", "I didn't have to be interesting. I just had to be honest. That's never happened in an app before."],
            ["🐳", "Five strangers, the same kind of heavy day. Somehow that was the lightest I'd felt all week."],
            ["🎈", "It disappeared at midnight and I was glad. Nothing to screenshot, nothing to perform."],
          ].map(([emoji, quote], i) => (
            <Reveal key={i} delay={i * 0.1} direction="up">
              <TiltCard className="h-full">
                <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-accent-light/60 text-xl">
                  {emoji}
                </div>
                <p className="text-[16px] leading-relaxed text-ink">&ldquo;{quote}&rdquo;</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────────────────── FAQ ────────────────────────────── */}
      <Section id="faq" eyebrow="Questions" title="The honest answers.">
        <FAQ />
      </Section>

      {/* ───────────────────── Final CTA ──────────────────────── */}
      <section className="relative px-6 py-32">
        <Aurora />
        <FloatingParticles count={14} />
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <Reveal direction="scale">
            <h2 className="font-serif-display text-[clamp(34px,6vw,60px)] leading-tight text-ink">
              How did today feel?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[17px] text-muted">
              Draw it. Someone out there had a day shaped just like yours.
            </p>
            <div className="mt-9 flex justify-center">
              <MagneticButton onClick={go}>
                Start VibeCheck
                <span aria-hidden>→</span>
              </MagneticButton>
            </div>
            <p className="mt-5 text-xs text-muted">No sign-up. No profile. Gone by midnight.</p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}

/* ── small local building blocks ── */

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h2 className="mb-12 max-w-2xl font-serif-display text-[clamp(28px,4.5vw,46px)] leading-tight text-ink">
          {title}
        </h2>
      </Reveal>
      {children}
    </section>
  );
}
