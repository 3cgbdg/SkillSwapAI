"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4 pt-8">
          <h1 className="font-heading text-h2 text-center">Reset password</h1>
          <p className="text-muted-foreground text-center text-sm">
            Password reset is handled by our support team for now. Email us and
            we&apos;ll send a secure link within one business day.
          </p>
          <a
            href="mailto:support@skillswap.app?subject=Password%20reset"
            className={cn(buttonVariants(), "w-full text-center")}
          >
            Email support
          </a>
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full text-center"
            )}
          >
            Back to log in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
