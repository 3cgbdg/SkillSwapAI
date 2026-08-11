import Link from "next/link";

import { cn } from "@/lib/utils";

export function GoogleAuthButton({ className }: { className?: string }) {
  const href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;

  return (
    <Link
      href={href}
      className={cn(
        "border-border bg-background hover:bg-muted flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
        className
      )}
    >
      {/* Google's official brand-mark colors — fixed, not part of this app's theme. */}
      { }
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-5.522 0-10-4.478-10-10s4.478-10 10-10c2.523 0 4.817.943 6.564 2.473l6.066-6.066C33.64 8.02 29.052 6 24 6 12.955 6 4 14.955 4 26s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
        />
        <path
          fill="#FF3D00"
          d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c2.523 0 4.817.943 6.564 2.473l6.066-6.066C33.64 8.02 29.052 6 24 6 12.686 6 3.553 15.192 1.306 26.692z"
        />
        <path
          fill="#4CAF50"
          d="M24 46c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 37.091 26.715 38 24 38c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C7.718 41.444 15.366 46 24 46z"
        />
        <path
          fill="#1976D2"
          d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 26c0-1.341-.138-2.65-.389-3.917z"
        />
      </svg>
      { }
      Continue with Google
    </Link>
  );
}
