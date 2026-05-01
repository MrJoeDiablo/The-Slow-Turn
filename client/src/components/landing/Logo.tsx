import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-sm tracking-[0.2em] uppercase", className)}>
      <svg width="18" height="18" viewBox="0 0 18 18" className="text-primary" aria-hidden>
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M1.5 9 H16.5 M9 1.5 V16.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span>The Slow Turn</span>
    </span>
  );
}