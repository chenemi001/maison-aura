import { OG_SIZE, renderOgImage } from "@/app/lib/og";

export const alt = "Maison Aura — luxury skincare, considered";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "The Signature Collection",
    title: "Skincare, quietly extraordinary.",
  });
}
