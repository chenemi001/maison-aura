"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/app/components/ui/Button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Forward to an error-reporting service (e.g. Sentry) in production.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-col items-center py-24 text-center" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-4xl md:text-5xl">We hit an unexpected snag</h1>
      <p className="mt-4 max-w-md text-taupe">
        Please try again. If the problem continues, our team has been notified
        {error.digest ? ` (reference ${error.digest})` : ""}.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Return home
        </ButtonLink>
      </div>
    </div>
  );
}
