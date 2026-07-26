import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SkillPill({
  label,
  variant,
  className,
}: {
  label: string;
  variant: "teach" | "learn";
  className?: string;
}) {
  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}

export function SkillPillList({
  skills,
  variant,
  max = 3,
  className,
}: {
  skills: { title: string }[];
  variant: "teach" | "learn";
  max?: number;
  className?: string;
}) {
  const visible = skills.slice(0, max);
  const overflow = skills.length - visible.length;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((skill) => (
        <SkillPill key={skill.title} label={skill.title} variant={variant} />
      ))}
      {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
    </div>
  );
}
