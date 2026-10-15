"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition, type FormEvent } from "react";
import { SearchIcon } from "@/app/components/ui/Icons";
import { cn } from "@/app/lib/utils";

interface ProductSearchProps {
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
}

/** Search box. Submits a standard `GET /search?q=` (works without JavaScript). */
export function ProductSearch({ defaultValue = "", autoFocus, className }: ProductSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const id = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    startTransition(() => router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search"));
  };

  return (
    <form role="search" action="/search" method="get" onSubmit={onSubmit} className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-5 size-5 -translate-y-1/2 text-taupe" />
      <input
        id={id}
        type="search"
        name="q"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        maxLength={100}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Search serums, ingredients, concerns…"
        className="h-14 w-full border border-beige-300 bg-porcelain pr-28 pl-13 text-base text-ink placeholder:text-taupe/70 focus:border-burgundy-700 focus:ring-2 focus:ring-burgundy-100 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute top-1/2 right-2 h-10 -translate-y-1/2 bg-burgundy-700 px-5 text-sm text-porcelain hover:bg-burgundy-800"
        aria-busy={isPending}
      >
        {isPending ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
