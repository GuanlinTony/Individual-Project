"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Shield } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Shield className="w-7 h-7 text-teal" strokeWidth={2} />
            <span className="absolute inset-0 rounded-full animate-pulse-ring bg-teal/30" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-ink tracking-tight">Aegis Nexus</div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-ink-dim">
              Asset Streaming
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-border text-ink"
                    : "text-ink-muted hover:text-ink hover:bg-bg-hover",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <div className="ml-4 pl-4 border-l border-border flex items-center gap-2 text-xs font-mono text-ink-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            edge-node · sfo-3
          </div>
        </nav>
      </div>
    </header>
  );
}
