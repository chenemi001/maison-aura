import type { ReactNode } from "react";
import { Breadcrumbs } from "@/app/components/ui/Breadcrumbs";

interface PolicyPageProps {
  title: string;
  path: string;
  updated: string;
  children: ReactNode;
}

/** Shared long-form layout for legal and help content. */
export function PolicyPage({ title, path, updated, children }: PolicyPageProps) {
  return (
    <article className="container-page max-w-3xl py-10 md:py-14">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <h1 className="mt-6 text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-taupe">Last updated {updated}</p>
      <div className="mt-10 space-y-6 leading-relaxed text-ink/90 [&_a]:text-burgundy-700 [&_a]:underline [&_h2]:mt-12 [&_h2]:text-3xl [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </article>
  );
}
