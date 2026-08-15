import { BookOpen, GraduationCap } from "lucide-react";

import { SkillPill } from "@/components/composites/SkillPill";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SwapAxisSkill = { title: string };

function SwapAxisColumn({
  label,
  icon: Icon,
  skills,
  variant,
  max,
}: {
  label: string;
  icon: typeof GraduationCap;
  skills: SwapAxisSkill[];
  variant: "teach" | "learn";
  max: number;
}) {
  const visible = skills.slice(0, max);
  const overflow = skills.length - visible.length;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div
        className={cn(
          "flex items-center gap-1.5 text-body-sm font-medium",
          variant === "teach" ? "text-accent-teach" : "text-accent-learn"
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.length === 0 ? (
          <span className="text-muted-foreground text-body-sm">
            No skills yet
          </span>
        ) : (
          <>
            {visible.map((skill) => (
              <SkillPill
                key={skill.title}
                label={skill.title}
                variant={variant}
              />
            ))}
            {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
          </>
        )}
      </div>
    </div>
  );
}

export function SwapAxis({
  teach,
  learn,
  teachLabel = "Teaches",
  learnLabel = "Wants to learn",
  max = 4,
  className,
}: {
  teach: SwapAxisSkill[];
  learn: SwapAxisSkill[];
  teachLabel?: string;
  learnLabel?: string;
  max?: number;
  className?: string;
}) {
  return (
    <div
      data-slot="swap-axis"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-surface p-3",
        className
      )}
    >
      <SwapAxisColumn
        label={teachLabel}
        icon={GraduationCap}
        skills={teach}
        variant="teach"
        max={max}
      />
      <span
        aria-hidden
        className="animate-swap-in text-muted-foreground mt-1 shrink-0 text-body font-medium"
      >
        ↔
      </span>
      <SwapAxisColumn
        label={learnLabel}
        icon={BookOpen}
        skills={learn}
        variant="learn"
        max={max}
      />
    </div>
  );
}
