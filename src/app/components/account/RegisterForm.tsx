"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/Button";
import { ErrorMessage } from "@/app/components/ui/ErrorMessage";
import { Input } from "@/app/components/ui/Input";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signUp, {});

  if (state.status === "success") {
    return (
      <ErrorMessage tone="info" title="Check your inbox">
        {state.message}
      </ErrorMessage>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && <ErrorMessage>{state.message}</ErrorMessage>}
      <Input
        label="Full name"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.fullName}
        error={state.fieldErrors?.fullName}
      />
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.email}
        error={state.fieldErrors?.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters, including a letter and a number."
        error={state.fieldErrors?.password}
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Create account
      </Button>
      <p className="text-center text-sm text-taupe">
        Already have an account?{" "}
        <Link href="/account/login" className="text-burgundy-700 underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
