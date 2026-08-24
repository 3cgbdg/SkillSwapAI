import { cn } from "@/lib/utils";

/**
 * Two circles — one "teach", one "learn" — overlapping, with the lens where
 * they meet picked out in the brand violet. That lens is the swap: the shared
 * ground between two people's skills.
 *
 * Uses the same accent-teach / accent-learn tokens the skill pills and match
 * cards already use, so the mark and the product speak the same colour
 * language. Solid geometry with no thin strokes, so it survives a 16px favicon.
 */
export function Logo({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="4 4 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle cx="17.5" cy="24" r="11" className="fill-accent-teach" />
      <circle cx="30.5" cy="24" r="11" className="fill-accent-learn" />
      {/* The lens: the intersection of the two circles, drawn on top. */}
      <path
        d="M24 15.13A11 11 0 0 1 24 32.87A11 11 0 0 1 24 15.13Z"
        className="fill-primary"
      />
    </svg>
  );
}
