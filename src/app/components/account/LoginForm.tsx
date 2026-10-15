"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/Button";
import { ErrorMessage } from "@/app/components/ui/ErrorMessage";
import { Input } from "@/app/components/ui/Input";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(signIn, {});

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && <ErrorMessage>{state.message}</ErrorMessage>}
      {next && <input type="hidden" name="next" value={next} />}
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
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Sign in
      </Button>
      <p className="text-center text-sm text-taupe">
        New to Maison Aura?{" "}
        <Link href="/account/register" className="text-burgundy-700 underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}
