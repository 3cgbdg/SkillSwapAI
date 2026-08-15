"use client";

import { useEffect } from "react";

import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
import { PageHeader } from "@/components/layouts";
import { Button } from "@/components/ui/button";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep console noise limited in production.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PageHeader
          className="flex-col items-center text-center sm:flex-col sm:items-center"
          illustration={
            <WarmScholarEmptyArt className="text-primary h-16 w-24" />
          }
          title="Something went wrong"
          description={error.message || "An unexpected error occurred."}
          actions={
            <Button type="button" onClick={reset}>
              Try again
            </Button>
          }
        />
      </div>
    </div>
  );
}
