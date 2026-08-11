"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { Spinner } from "@/components/ui/spinner";
import { showErrorToast } from "@/utils/toast";

export function AsyncBoundary({
  isLoading,
  isError,
  error,
  errorMessage,
  loadingFallback,
  children,
}: {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  errorMessage?: string;
  loadingFallback?: ReactNode;
  children: ReactNode;
}) {
  useEffect(() => {
    if (isError) {
      showErrorToast(errorMessage ?? error?.message ?? "Something went wrong");
    }
  }, [isError, error, errorMessage]);

  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )
    );
  }

  return <>{children}</>;
}
