import { describe, expect, it } from "vitest";
import {
  cartLinesSchema,
  fieldErrors,
  registerSchema,
  safeRedirectPath,
  shippingSchema,
} from "@/app/lib/validations";

const validShipping = {
  email: "  Jane@Example.COM ",
  fullName: "Jane Doe",
  line1: "12 Admiralty Way",
  line2: "",
  city: "Lekki",
  state: "Lagos",
  postcode: "",
  country: "NG",
  phone: "0803 123 4567",
};

describe("shippingSchema", () => {
  it("normalises valid input", () => {
    const result = shippingSchema.parse(validShipping);
    expect(result.email).toBe("jane@example.com");
    expect(result.line2).toBeUndefined();
    expect(result.postcode).toBeUndefined();
    expect(result.phone).toBe("+2348031234567");
  });

  it.each(["08031234567", "+234 803 123 4567", "234-803-123-4567", "0703 123 4567", "0913 123 4567"])(
    "accepts Nigerian mobile format %s",
    (phone) => {
      expect(shippingSchema.parse({ ...validShipping, phone }).phone).toMatch(/^\+234[789][01]\d{8}$/);
    },
  );

  it("defaults the country to Nigeria and rejects others", () => {
    expect(shippingSchema.parse({ ...validShipping, country: undefined }).country).toBe("NG");
    expect(shippingSchema.safeParse({ ...validShipping, country: "GB" }).success).toBe(false);
  });

  it("reports field-level errors", () => {
    const result = shippingSchema.safeParse({
      ...validShipping,
      email: "nope",
      state: "Atlantis",
      postcode: "12",
      phone: "12345",
    });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(Object.keys(errors).sort()).toEqual(["email", "phone", "postcode", "state"]);
  });
});

describe("cartLinesSchema", () => {
  it("accepts IDs and quantities only, within limits", () => {
    expect(cartLinesSchema.safeParse([{ productId: "ma-1", variantId: "ma-1-30ml", quantity: 2 }]).success).toBe(true);
    expect(cartLinesSchema.safeParse([]).success).toBe(false);
    expect(cartLinesSchema.safeParse([{ productId: "ma-1", variantId: "v", quantity: 11 }]).success).toBe(false);
    expect(cartLinesSchema.safeParse([{ productId: "ma-1", variantId: "v", quantity: 1.5 }]).success).toBe(false);
  });

  it("strips client-supplied prices", () => {
    const parsed = cartLinesSchema.parse([{ productId: "a", variantId: "b", quantity: 1, unitPriceCents: 1 }]);
    expect(parsed[0]).not.toHaveProperty("unitPriceCents");
  });
});

describe("registerSchema", () => {
  const base = { fullName: "Jane Doe", email: "jane@example.com", password: "s3curepass", confirmPassword: "s3curepass" };

  it("accepts a strong, matching password", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects weak or mismatched passwords", () => {
    expect(registerSchema.safeParse({ ...base, password: "short1", confirmPassword: "short1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "lettersonly", confirmPassword: "lettersonly" }).success).toBe(false);
    const mismatch = registerSchema.safeParse({ ...base, confirmPassword: "different1" });
    expect(fieldErrors(mismatch.error!)).toHaveProperty("confirmPassword");
  });
});

describe("safeRedirectPath", () => {
  it.each([
    ["/account/orders", "/account/orders"],
    ["https://evil.example", "/account"],
    ["//evil.example", "/account"],
    ["/\\evil.example", "/account"],
    [null, "/account"],
  ])("%s → %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});
