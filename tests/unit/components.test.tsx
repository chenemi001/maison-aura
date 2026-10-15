// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartSummary } from "@/app/components/cart/CartSummary";
import { Price } from "@/app/components/ui/Price";
import { Rating } from "@/app/components/ui/Rating";
import { calculateTotals } from "@/app/lib/pricing";

describe("<Price />", () => {
  it("announces sale and original prices to screen readers", () => {
    render(<Price amountCents={3_000_000} compareAtCents={3_600_000} />);
    expect(screen.getByText("₦30,000")).toBeInTheDocument();
    expect(screen.getByText("₦36,000").tagName).toBe("S");
    expect(screen.getByText("Sale price:")).toHaveClass("sr-only");
  });
});

describe("<Rating />", () => {
  it("exposes an accessible text alternative", () => {
    render(<Rating value={4.8} count={1932} />);
    expect(screen.getByRole("img", { name: "Rated 4.8 out of 5 from 1,932 reviews" })).toBeInTheDocument();
  });
});

describe("<CartSummary />", () => {
  it("shows totals and free-delivery progress", () => {
    render(<CartSummary totals={calculateTotals([{ unitPriceCents: 5_000_000, quantity: 1 }])} />);
    expect(screen.getByText("₦3,500")).toBeInTheDocument();
    expect(screen.getByTestId("cart-total")).toHaveTextContent("₦53,500");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText(/₦50,000 away from complimentary delivery/)).toBeInTheDocument();
  });

  it("shows complimentary delivery over the threshold", () => {
    render(<CartSummary totals={calculateTotals([{ unitPriceCents: 12_000_000, quantity: 1 }])} />);
    expect(screen.getByText("Complimentary")).toBeInTheDocument();
  });
});
