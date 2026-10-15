"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { CloseIcon, MenuIcon } from "@/app/components/ui/Icons";

interface NavLink {
  href: string;
  label: string;
}

/**
 * Mobile navigation drawer built on the native `<dialog>` element, which
 * provides focus trapping, `Escape` to close and an inert background for free.
 */
export function MobileMenu({ links, categories }: { links: NavLink[]; categories: NavLink[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const target = event.target as HTMLElement;
    // Close when the backdrop (the dialog element itself) or any link is clicked.
    if (target === dialogRef.current || target.closest("a")) dialogRef.current?.close();
  };

  return (
    <>
      <button
        type="button"
        className="site-header-icon inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-beige-100 lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        <MenuIcon className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Menu"
        className="m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-cream p-0 text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
        onClick={onDialogClick}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-beige-200 px-4">
            <span className="font-serif text-lg tracking-[0.3em] text-burgundy-700 uppercase">
              Maison Aura
            </span>
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-full hover:bg-beige-100"
              aria-label="Close menu"
              onClick={() => dialogRef.current?.close()}
            >
              <CloseIcon className="size-6" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block px-3 py-3 font-serif text-2xl hover:bg-beige-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="eyebrow mt-8 px-3">Categories</p>
            <ul className="mt-2 space-y-1">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="block px-3 py-2.5 text-sm hover:bg-beige-100">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-beige-200 px-7 py-5 text-sm">
            <Link href="/account" className="hover:text-burgundy-700">
              My account
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
