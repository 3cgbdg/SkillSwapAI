import { cn } from "@/lib/utils";

export function PresenceDot({
  online,
  className,
}: {
  online: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background",
        online ? "bg-success" : "bg-muted-foreground",
        className
      )}
      aria-hidden
    />
  );
}
