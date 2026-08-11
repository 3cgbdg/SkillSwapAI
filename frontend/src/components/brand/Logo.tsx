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
        d="M10 22V10h4.2c2.4 0 3.9 1.2 3.9 3.1 0 1.3-.7 2.3-1.9 2.8L20 22h-3.2l-3.4-5.4H13V22H10Zm3-8.2h1c1.1 0 1.7-.5 1.7-1.4S15.1 11 14 11H13v2.8Z"
        className="fill-primary-foreground"
      />
      <circle cx="22.5" cy="11.5" r="2.5" className="fill-brand-accent" />
    </svg>
  );
}
