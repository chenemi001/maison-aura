const ITEMS = [
  "Dermatologist tested",
  "Vegan & cruelty-free",
  "Refillable glass",
  "Small-batch formulas",
  "Free nationwide delivery over ₦100,000",
  "Clinically studied actives",
];

/** Slow, continuously scrolling strip of brand values (pure CSS, pauses on hover). */
export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="Our promises" className="group overflow-hidden border-b border-beige-200 bg-cream py-5">
      <ul className="flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
        {row.map((item, i) => (
          <li
            key={i}
            aria-hidden={i >= ITEMS.length || undefined}
            className="flex items-center gap-12 font-display text-xl tracking-[0.14em] whitespace-nowrap text-ink/80 uppercase"
          >
            {item}
            <span className="size-1.5 rotate-45 bg-burgundy-700" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </section>
  );
}
