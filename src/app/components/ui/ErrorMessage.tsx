import type { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

interface ErrorMessageProps {
  title?: string;
  children: ReactNode;
  tone?: "error" | "info";
  className?: string;
}

/** Inline alert for form and page-level messages. */
export function ErrorMessage({ title, children, tone = "error", className }: ErrorMessageProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "border px-4 py-3 text-sm",
        tone === "error"
          ? "border-danger/30 bg-burgundy-50 text-burgundy-900"
          : "border-beige-300 bg-beige-100 text-ink",
        className,
      )}
    >
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
