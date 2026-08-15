import Link from "next/link";

import { WarmScholarEmptyArt } from "@/components/illustrations/WarmScholarEmptyArt";
import { PageHeader } from "@/components/layouts";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      id="main-content"
      className="flex min-h-dvh items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <PageHeader
          className="flex-col items-center text-center sm:flex-col sm:items-center"
          illustration={
            <WarmScholarEmptyArt className="text-primary h-16 w-24" />
          }
          title="Page not found"
          description="The page you're looking for doesn't exist or was moved."
          actions={
            <Link href="/dashboard" className={buttonVariants()}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    </div>
  );
}
