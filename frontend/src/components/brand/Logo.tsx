import { cn } from "@/lib/utils";

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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M19 12.6c0-2-2.1-2.8-4.1-2.8s-4 .9-4 2.7c0 3.6 8.6 1.8 8.6 5.8 0 2-2.2 3.1-4.4 3.1s-4.2-1-4.3-3.1"
        className="stroke-primary-foreground"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22.5" cy="11.5" r="2.5" className="fill-brand-accent" />
    </svg>
  );
}
