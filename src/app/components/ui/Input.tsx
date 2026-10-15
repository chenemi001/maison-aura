import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/app/lib/utils";

const fieldBase =
  "block w-full border bg-porcelain px-4 text-ink placeholder:text-taupe/70 transition-colors focus:border-burgundy-700 focus:outline-none focus:ring-2 focus:ring-burgundy-100";

interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  hideLabel?: boolean;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  hideLabel,
  required,
  children,
}: FieldProps & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={cn("block text-sm font-medium text-ink", hideLabel && "sr-only")}>
        {label}
        {required && (
          <span className="text-burgundy-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-taupe">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function Input({
  label,
  error,
  hint,
  hideLabel,
  className,
  id: idProp,
  ...props
}: FieldProps & ComponentProps<"input">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} hideLabel={hideLabel} required={props.required}>
      <input
        id={id}
        className={cn(fieldBase, "h-12", error ? "border-danger" : "border-beige-300", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  error,
  hint,
  hideLabel,
  className,
  id: idProp,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} hideLabel={hideLabel} required={props.required}>
      <select
        id={id}
        className={cn(fieldBase, "h-12 appearance-none pr-10", error ? "border-danger" : "border-beige-300", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
