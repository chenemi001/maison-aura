import { z } from "zod";
import { MAX_QUANTITY_PER_LINE } from "@/app/lib/pricing";
import { NIGERIAN_STATES, SHIPPING_COUNTRIES } from "@/app/lib/shipping";

// Normalise first, then validate, so pasted addresses with stray spaces pass.
const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email({ error: "Enter a valid email address" }));

export const cartLinesSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(32),
      variantId: z.string().min(1).max(64),
      quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
    }),
  )
  .min(1, { error: "Your bag is empty" })
  .max(50, { error: "Too many items in your bag" });

export type CartLineInput = z.infer<typeof cartLinesSchema>[number];


const countryCodes = SHIPPING_COUNTRIES.map((c) => c.code) as [string, ...string[]];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

/**
 * Nigerian mobile numbers, local (0803 123 4567) or international
 * (+234 803 123 4567). Normalised to E.164 (+2348031234567).
 */
const nigerianPhone = z
  .string()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^(?:\+?234|0)[789][01]\d{8}$/, { error: "Enter a valid Nigerian phone number" }))
  .transform((v) => `+234${v.replace(/^(?:\+?234|0)/, "")}`);

export const shippingSchema = z.object({
  email,
  fullName: z.string().trim().min(2, { error: "Enter your full name" }).max(100),
  line1: z.string().trim().min(3, { error: "Enter your street address" }).max(120),
  line2: optionalText(120),
  city: z.string().trim().min(2, { error: "Enter your town or city" }).max(80),
  state: z.enum(NIGERIAN_STATES, { error: "Choose your state" }),
  // Postcodes are rarely used for Nigerian deliveries, so this is optional.
  postcode: z
    .string()
    .trim()
    .regex(/^(\d{6})?$/, { error: "Nigerian postcodes have 6 digits" })
    .optional()
    .transform((v) => v || undefined),
  country: z.enum(countryCodes, { error: "We currently deliver within Nigeria only" }).default("NG"),
  // Required: couriers call ahead to arrange delivery.
  phone: nigerianPhone,
});

export type ShippingInput = z.infer<typeof shippingSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Enter your password" }).max(128),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, { error: "Enter your full name" }).max(100),
    email,
    password: z
      .string()
      .min(8, { error: "Use at least 8 characters" })
      .max(128)
      .regex(/[A-Za-z]/, { error: "Include at least one letter" })
      .regex(/\d/, { error: "Include at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const newsletterSchema = z.object({ email });

/** Flattens a ZodError into `{ field: firstMessage }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Only allow same-origin relative redirects (prevents open redirects). */
export function safeRedirectPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
