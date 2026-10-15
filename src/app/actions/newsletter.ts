"use server";

import { createAdminClient, isAdminConfigured } from "@/app/lib/supabase/admin";
import { newsletterSchema } from "@/app/lib/validations";

export interface NewsletterState {
  status?: "success" | "error";
  message?: string;
}

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Enter a valid email address" };
  }

  // Honeypot: real visitors never see or fill this field.
  if (formData.get("company")) return { status: "success", message: "Thank you for subscribing." };

  if (!isAdminConfigured()) {
    return {
      status: "error",
      message: "Newsletter sign-up isn't available on this deployment yet.",
    };
  }

  const { error } = await createAdminClient()
    .from("newsletter_subscribers")
    .upsert({ email: parsed.data.email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    console.error("[newsletter] subscribe failed", error.message);
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  return { status: "success", message: "Thank you — welcome to the Maison." };
}
