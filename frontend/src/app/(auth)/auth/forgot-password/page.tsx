"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { AuthBrand } from "@/components/auth/AuthBrand";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-lg" elevation="raised">
      <CardContent className="flex flex-col gap-6 pt-10">
        <AuthBrand />
        <div className="text-center">
          <h2 className="font-heading text-h2">Reset password</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Password reset is handled by our support team for now. Email us and
            we&apos;ll send a secure link within one business day.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <a
            href="mailto:support@skillswap.app?subject=Password%20reset"
            className={cn(buttonVariants({ size: "lg" }), "w-full text-center")}
          >
            Email support
          </a>
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full text-center"
            )}
          >
            Back to log in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
