import Link from "next/link";
import { AccountMenu } from "@/app/components/account/AccountMenu";
import { CartBadge } from "@/app/components/cart/CartBadge";
import { HeaderShell } from "@/app/components/layout/HeaderShell";
import { MobileMenu } from "@/app/components/layout/MobileMenu";
import { SearchIcon } from "@/app/components/ui/Icons";
import { CATEGORIES } from "@/app/data/categories";

const PRIMARY_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/categories/serums", label: "Serums" },
  { href: "/categories/moisturisers", label: "Moisturisers" },
  { href: "/categories/masks", label: "Rituals" },
  { href: "/products?sort=newest", label: "New in" },
];

export function Navbar() {
  return (
    <HeaderShell>
      <div className="container-page flex h-16 items-center justify-between gap-2 lg:grid lg:h-[4.5rem] lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        <div className="flex items-center gap-2">
          <MobileMenu
            links={PRIMARY_LINKS}
            categories={CATEGORIES.map((c) => ({ href: `/categories/${c.slug}`, label: c.name }))}
          />
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[11px] font-medium tracking-[0.2em] uppercase">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative py-2 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Link
          href="/"
          className="font-display text-xl whitespace-nowrap tracking-[0.28em] uppercase sm:text-2xl lg:text-[1.7rem]"
          aria-label="Maison Aura — home"
        >
          Maison Aura
        </Link>

        <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
          <Link
            href="/search"
            className="site-header-icon inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-beige-100"
            aria-label="Search products"
          >
            <SearchIcon className="size-5" />
          </Link>
          <AccountMenu />
          <CartBadge />
        </div>
      </div>
    </HeaderShell>
  );
}
