import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-hair bg-canvas px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 md:flex-row">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A quieter way to meet people who truly understand how today felt. Presence over
            permanence.
          </p>
          <p className="mt-6 text-xs text-muted/70">
            If you&apos;re going through a hard time, you deserve real support. In the US, call or
            text 988 anytime.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm sm:grid-cols-3">
          {[
            ["Product", ["How it works", "Privacy", "Features"]],
            ["Company", ["Our promise", "Manifesto", "Contact"]],
            ["Legal", ["Terms", "Privacy policy", "Safety"]],
          ].map(([head, links]) => (
            <div key={head as string}>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink">{head}</p>
              <ul className="space-y-2">
                {(links as string[]).map((l) => (
                  <li key={l}>
                    <span className="text-muted transition-colors hover:text-ink">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-hair pt-6 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} VibeCurve. Made with care.</span>
        <Link href="/app" className="text-accent transition hover:text-ink">
          Draw your day →
        </Link>
      </div>
    </footer>
  );
}
