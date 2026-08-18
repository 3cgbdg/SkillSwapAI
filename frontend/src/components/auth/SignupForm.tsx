"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthBrand } from "@/components/auth/AuthBrand";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { SkillPicker } from "@/components/auth/SkillPicker";
import { Stepper } from "@/components/composites";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthService from "@/services/AuthService";
import { signUpSchema, type signUpFormData } from "@/validation/signUp";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import {
  passwordStrengthLabel,
  passwordStrengthScore,
} from "@/utils/passwordStrength";
import { Progress } from "@/components/ui/progress";

const STEPS = ["Account", "Skills", "Confirm"] as const;
const TOTAL_STEPS = STEPS.length;

const STEP_FIELDS = {
  1: ["name", "email", "password", "confirmPassword"],
  2: ["knownSkills", "skillsToLearn"],
} as const satisfies Record<number, (keyof signUpFormData)[]>;

function PasswordField({
  id,
  label,
  error,
  showPassword,
  onToggle,
  ...inputProps
}: {
  id: string;
  label: string;
  error?: string;
  showPassword: boolean;
  onToggle: () => void;
} & ComponentProps<"input">) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <div className="relative">
        <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className="pr-10 pl-9"
          {...inputProps}
        />
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={onToggle}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </Field>
  );
}

export function SignupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<signUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      knownSkills: [],
      skillsToLearn: [],
      checkBox: false,
    },
  });

  const knownSkills = watch("knownSkills");
  const skillsToLearn = watch("skillsToLearn");
  const passwordValue = watch("password") ?? "";
  const strength = passwordStrengthScore(passwordValue);

  const mutation = useMutation({
    mutationFn: async (data: signUpFormData) => {
      const { checkBox, ...signUpData } = data;
      void checkBox;
      return AuthService.signUp(
        signUpData,
        data.knownSkills,
        data.skillsToLearn
      );
    },
    onSuccess: (data) => {
      showSuccessToast(data.message);
      queryClient.clear();
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const goNext = async () => {
    const fields = STEP_FIELDS[step as keyof typeof STEP_FIELDS];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <Card className="w-full max-w-lg" elevation="raised">
      <CardContent className="flex flex-col gap-6 pt-10">
        <AuthBrand />
        <div className="text-center">
          <h2 className="font-heading text-h2">Join our community</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Create your account to connect and learn.
          </p>
        </div>
        <Stepper steps={[...STEPS]} currentStep={step} className="px-2" />
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit((data) => {
            if (step === TOTAL_STEPS) mutation.mutate(data);
          })}
        >
          {step === 1 ? (
            <>
              <Field
                label="Full Name"
                htmlFor="name"
                error={errors.name?.message}
              >
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input id="name" className="pl-9" {...register("name")} />
                </div>
              </Field>
              <Field
                label="Email"
                htmlFor="email"
                error={errors.email?.message}
              >
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input id="email" className="pl-9" {...register("email")} />
                </div>
              </Field>
              <PasswordField
                id="password"
                label="Password"
                error={errors.password?.message}
                showPassword={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                {...register("password")}
              />
              {passwordValue ? (
                <div className="flex flex-col gap-1">
                  <Progress value={(strength / 4) * 100} className="h-1.5" />
                  <p className="text-muted-foreground text-xs">
                    Strength: {passwordStrengthLabel(strength)}
                  </p>
                </div>
              ) : null}
              <PasswordField
                id="confirmPassword"
                label="Confirm Password"
                error={errors.confirmPassword?.message}
                showPassword={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((v) => !v)}
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={goNext}
              >
                Continue
              </Button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <SkillPicker
                label="Skills I Know"
                placeholder="e.g., Web Development"
                skills={knownSkills}
                onChange={(skills) =>
                  setValue("knownSkills", skills, { shouldValidate: true })
                }
                badgeVariant="teach"
                error={errors.knownSkills?.message}
              />
              <SkillPicker
                label="Skills To Learn"
                placeholder="e.g., UI/UX Design"
                skills={skillsToLearn}
                onChange={(skills) =>
                  setValue("skillsToLearn", skills, { shouldValidate: true })
                }
                badgeVariant="learn"
                error={errors.skillsToLearn?.message}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={goBack}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  size="lg"
                  onClick={goNext}
                >
                  Continue
                </Button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    You can teach
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {knownSkills.map((skill) => (
                      <Badge key={skill} variant="teach">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-muted-foreground text-xs font-medium">
                    You want to learn
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsToLearn.map((skill) => (
                      <Badge key={skill} variant="learn">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Controller
                name="checkBox"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <Label htmlFor="terms" className="text-sm font-normal">
                        Accept Terms and Conditions
                      </Label>
                    </div>
                    {errors.checkBox ? (
                      <p className="text-destructive text-sm">
                        {errors.checkBox.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={goBack}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  loading={mutation.isPending}
                >
                  Sign up
                </Button>
              </div>
            </>
          ) : null}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 border-t">
        <GoogleAuthButton />
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
