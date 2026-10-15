import { cacheLife } from "next/cache";
import Link from "next/link";
import { CATEGORIES } from "@/app/data/categories";

const HELP_LINKS = [
  { href: "/policies/returns", label: "Delivery & returns" },
  { href: "/account/orders", label: "Track an order" },
  { href: "/policies/terms", label: "Terms of sale" },
  { href: "/policies/privacy", label: "Privacy policy" },
];

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const linkClass = "text-burgundy-100 transition-colors hover:text-porcelain";

export function Footer() {
  return (
    <footer className="mt-32 overflow-hidden bg-burgundy-950 text-porcelain">
      <div className="container-page grid gap-12 pt-20 pb-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div className="max-w-sm">
          <p className="text-[11px] font-medium tracking-[0.3em] text-burgundy-100 uppercase">Maison Aura</p>
          <p className="mt-5 font-serif text-2xl leading-snug">
            Considered skincare, crafted in small batches — because beautiful skin should never cost the earth.
          </p>
        </div>

        <nav aria-labelledby="footer-shop">
          <h2 id="footer-shop" className="font-sans text-[11px] font-medium tracking-[0.25em] uppercase">
            Shop
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/products" className={linkClass}>
                All products
              </Link>
            </li>
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/categories/${c.slug}`} className={linkClass}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-help">
          <h2 id="footer-help" className="font-sans text-[11px] font-medium tracking-[0.25em] uppercase">
            Customer care
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p
        aria-hidden="true"
        className="container-page font-display text-[clamp(3rem,13.2vw,14rem)] leading-[0.8] tracking-[0.02em] whitespace-nowrap text-burgundy-800 uppercase select-none"
      >
        Maison Aura
      </p>

      <div className="border-t border-porcelain/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-burgundy-100 sm:flex-row sm:justify-between">
          <p>
            © <CopyrightYear /> Maison Aura. A portfolio demonstration store.
          </p>
          <p>Payments securely processed by Stripe · Photography via Unsplash</p>
        </div>
      </div>
    </footer>
  );
}
