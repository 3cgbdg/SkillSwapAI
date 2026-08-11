import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type cardVariants,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type Elevation = NonNullable<VariantProps<typeof cardVariants>["elevation"]>;

export function SectionPanel({
  title,
  description,
  children,
  footer,
  elevation = "flat",
  className,
  contentClassName,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  elevation?: Elevation;
  className?: string;
  contentClassName?: string;
}) {
  const hasHeader = title != null || description != null;

  return (
    <Card elevation={elevation} className={className}>
      {hasHeader ? (
        <CardHeader>
          {title != null ? <CardTitle>{title}</CardTitle> : null}
          {description != null ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent
        className={cn(!hasHeader && "pt-(--card-spacing)", contentClassName)}
      >
        {children}
      </CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  );
}
