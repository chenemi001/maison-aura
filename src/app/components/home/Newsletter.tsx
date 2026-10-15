"use client";

import Image from "next/image";
import { useActionState, useId } from "react";
import { subscribeToNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import { Reveal } from "@/app/components/motion/Reveal";
import { Button } from "@/app/components/ui/Button";
import { EDITORIAL } from "@/app/data/images";

export function Newsletter() {
  const [state, formAction, pending] = useActionState<NewsletterState, FormData>(subscribeToNewsletter, {});
  const id = useId();

  return (
    <section aria-labelledby={`${id}-heading`} className="container-page mt-28">
      <div className="grid overflow-hidden bg-sand md:grid-cols-[1fr_1.1fr]">
        <div className="relative min-h-72 md:min-h-[34rem]">
          <Image
            src={EDITORIAL.profile}
            alt="Profile of a woman with a braided ponytail against a warm tan backdrop"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover object-top"
          />
        </div>
        <Reveal className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16">
          <p className="eyebrow">The Maison letter</p>
          <h2 id={`${id}-heading`} className="mt-4 font-display text-5xl leading-[1.02] uppercase md:text-6xl">
            Rituals, launches &amp; quiet luxuries
          </h2>
          <p className="mt-5 max-w-md text-taupe">
            Early access to new formulas and 10% off your first order. Unsubscribe at any time.
          </p>

          {state.status === "success" ? (
            <p role="status" className="mt-10 font-serif text-2xl text-burgundy-800">
              {state.message}
            </p>
          ) : (
            <form action={formAction} className="mt-10 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
              <label htmlFor={`${id}-email`} className="sr-only">
                Email address
              </label>
              <input
                id={`${id}-email`}
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Your email address"
                aria-invalid={state.status === "error" || undefined}
                aria-describedby={state.message ? `${id}-message` : undefined}
                className="h-13 flex-1 border-b border-ink/40 bg-transparent px-1 text-ink placeholder:text-taupe focus:border-ink focus:outline-none"
              />
              {/* Honeypot field for bots — hidden from people and assistive tech. */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <Button type="submit" size="lg" loading={pending}>
                Subscribe
              </Button>
            </form>
          )}
          {state.status === "error" && (
            <p id={`${id}-message`} role="alert" className="mt-4 text-sm text-danger">
              {state.message}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
