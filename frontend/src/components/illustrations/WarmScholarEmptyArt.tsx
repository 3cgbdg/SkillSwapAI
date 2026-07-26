"use client";

export function WarmScholarEmptyArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} role="img" aria-hidden>
      <rect
        x="8"
        y="12"
        width="48"
        height="56"
        rx="8"
        className="fill-primary/15 stroke-primary/40"
        strokeWidth="2"
      />
      <rect
        x="64"
        y="20"
        width="48"
        height="48"
        rx="8"
        className="fill-brand-accent/25 stroke-brand-accent/50"
        strokeWidth="2"
      />
      <path
        d="M20 28h24M20 36h18M20 44h22"
        className="stroke-primary/50"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="88" cy="44" r="10" className="fill-primary/30" />
    </svg>
  );
}
