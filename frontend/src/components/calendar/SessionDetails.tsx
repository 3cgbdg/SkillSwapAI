"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SessionDetailsData = {
  descr?: string;
  meetingLink: string | null;
};

export function SessionDetails({
  details,
  onClose,
  className,
}: {
  details: SessionDetailsData;
  onClose: () => void;
  className?: string;
}) {
  return (
    <Card className={className} style={{ zIndex: "var(--z-dropdown)" }}>
      {details.descr ? (
        <CardHeader className="border-b border-border pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              aria-label="Close session details"
            >
              <X size={16} />
            </Button>
          </div>
          <p className="text-xs leading-4 text-muted-foreground">
            {details.descr}
          </p>
        </CardHeader>
      ) : null}
      {details.meetingLink ? (
        <CardContent className="text-xs leading-4 text-muted-foreground">
          Meeting Link:{" "}
          <Link
            href={details.meetingLink}
            className="font-medium text-foreground hover:underline"
          >
            {details.meetingLink}
          </Link>
        </CardContent>
      ) : null}
    </Card>
  );
}
