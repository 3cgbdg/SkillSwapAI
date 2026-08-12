"use client";

export function SkillSwapMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} role="img" aria-hidden>
      <circle
        cx="46"
        cy="60"
        r="34"
        className="fill-accent-teach/25 stroke-accent-teach/60"
        strokeWidth="2"
      />
      <circle
        cx="114"
        cy="60"
        r="34"
        className="fill-accent-learn/25 stroke-accent-learn/60"
        strokeWidth="2"
      />
      <circle cx="46" cy="52" r="10" className="fill-accent-teach" />
      <path
        d="M30 84c4-11 12-16 16-16s12 5 16 16"
        className="stroke-accent-teach"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="114" cy="52" r="10" className="fill-accent-learn" />
      <path
        d="M98 84c4-11 12-16 16-16s12 5 16 16"
        className="stroke-accent-learn"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68 44c8-10 16-10 24 0"
        className="stroke-accent-learn"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M94 42l-2-6-6 2"
        className="stroke-accent-learn"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M92 76c-8 10-16 10-24 0"
        className="stroke-accent-teach"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M66 78l2 6 6-2"
        className="stroke-accent-teach"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
