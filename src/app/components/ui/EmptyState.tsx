import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: "h1" | "h2";
}

export function EmptyState({ title, description, action, headingLevel = "h2" }: EmptyStateProps) {
  const Heading = headingLevel;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <svg viewBox="0 0 64 64" className="mb-6 size-14 text-beige-300" fill="none" aria-hidden="true">
        <path d="M16 64V30a16 16 0 0 1 32 0v34" stroke="currentColor" strokeWidth="2" />
        <circle cx="32" cy="22" r="3" fill="currentColor" />
      </svg>
      <Heading className="text-3xl text-ink">{title}</Heading>
      {description && <div className="mt-3 text-taupe">{description}</div>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
