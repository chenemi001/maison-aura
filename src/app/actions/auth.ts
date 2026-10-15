"use server";

import { redirect } from "next/navigation";
import { getSiteUrl, isSupabaseConfigured } from "@/app/lib/env";
import { createClient } from "@/app/lib/supabase/server";
import { fieldErrors, loginSchema, registerSchema, safeRedirectPath } from "@/app/lib/validations";

export interface AuthFormState {
  status?: "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  email?: string;
}

const NOT_CONFIGURED: AuthFormState = {
  status: "error",
  message: "Customer accounts are not enabled on this deployment (Supabase is not configured).",
};

export async function signIn(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error), email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Deliberately generic: never reveal whether an email is registered.
    return { status: "error", message: "That email and password combination didn't match.", email };
  }

  redirect(safeRedirectPath(formData.get("next")));
}

export async function signUp(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  const email = String(formData.get("email") ?? "");
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email,
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: fieldErrors(parsed.error), email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=/account`,
    },
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "weak_password"
          ? "Please choose a stronger password."
          : "We couldn't create your account. Please try again.",
      email,
    };
  }

  // With email confirmation disabled, Supabase signs the user straight in.
  if (data.session) redirect("/account");

  return {
    status: "success",
    message: `Almost there — we've sent a confirmation link to ${parsed.data.email}.`,
  };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
