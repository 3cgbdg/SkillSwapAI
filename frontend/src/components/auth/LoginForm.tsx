"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthBrand } from "@/components/auth/AuthBrand";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import AuthService from "@/services/AuthService";
import { logInSchema, type logInFormData } from "@/validation/logIn";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<logInFormData>({
    resolver: zodResolver(logInSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: logInFormData) => AuthService.logIn(data),
    onSuccess: async (data) => {
      showSuccessToast(data.message);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  return (
    <Card className="w-full max-w-lg" elevation="raised">
      <CardContent className="flex flex-col gap-6 pt-10">
        <AuthBrand />
        <div className="text-center">
          <h2 className="font-heading text-h2">Welcome back</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Log in to your SkillSwap AI account.
          </p>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
        >
          <Field label="Email" htmlFor="email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input id="email" className="pl-9" {...register("email")} />
            </div>
          </Field>
          <Field
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <div className="relative">
              <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10 pl-9"
                {...register("password")}
              />
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </Field>
          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-primary text-sm font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={mutation.isPending}
          >
            Log in
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t">
        <GoogleAuthButton />
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
