/**
 * Generates the storefront's illustrative SVG artwork into /public.
 *
 * The demo catalogue has no product photography, so every product, category
 * and banner image is a lightweight, on-brand vector illustration (1–4 KB
 * each). Run with: `npm run generate:art`
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const TONES = {
  ivory: { bg: ["#F6F0E7", "#E9DDCC"], body: ["#FFFDF9", "#E6DACB"], cap: ["#D9C7AE", "#B79F7F"], label: "#6E1E2E", labelBg: "#FFFFFF" },
  blush: { bg: ["#F5E8E4", "#E6CFC8"], body: ["#F9ECE8", "#DDBAB1"], cap: ["#CFAF7A", "#A8844C"], label: "#6E1E2E", labelBg: "#FFF8F5" },
  claret: { bg: ["#F1E7DD", "#E0CFBF"], body: ["#8C3446", "#4E1220"], cap: ["#E6D5BC", "#C4AA86"], label: "#F6EDE3", labelBg: "none" },
  sand: { bg: ["#F1E8DA", "#DCC9AE"], body: ["#DDC39C", "#AE8A5E"], cap: ["#3A2B25", "#1E1512"], label: "#3A2B25", labelBg: "#F8F1E6" },
};

const write = (path, svg) => {
  const file = join(root, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.replace(/\n\s*/g, "").trim() + "\n");
};

const defs = (id, t) => `
  <linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="${t.body[0]}"/><stop offset="1" stop-color="${t.body[1]}"/></linearGradient>
  <linearGradient id="${id}c" x1="0" x2="1"><stop offset="0" stop-color="${t.cap[0]}"/><stop offset="1" stop-color="${t.cap[1]}"/></linearGradient>
  <linearGradient id="${id}h" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;

const label = (t, x, y, w, h, scale = 1) => `
  ${t.labelBg !== "none" ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${t.labelBg}" opacity=".9"/>` : ""}
  <text x="${x + w / 2}" y="${y + h * 0.42}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${22 * scale}" letter-spacing="${6 * scale}" fill="${t.label}">MAISON</text>
  <text x="${x + w / 2}" y="${y + h * 0.42 + 26 * scale}" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="${22 * scale}" letter-spacing="${6 * scale}" fill="${t.label}">AURA</text>
  <line x1="${x + w * 0.3}" x2="${x + w * 0.7}" y1="${y + h * 0.42 + 44 * scale}" y2="${y + h * 0.42 + 44 * scale}" stroke="${t.label}" stroke-width="1.2" opacity=".6"/>`;

/** Each vessel is drawn centred on x=400 with its base resting on y=860. */
const VESSELS = {
  dropper: (id, t) => `
    <rect x="300" y="500" width="200" height="360" rx="44" fill="url(#${id}b)"/>
    <rect x="352" y="440" width="96" height="70" rx="10" fill="url(#${id}c)"/>
    <path d="M368 440 V330 a32 32 0 0 1 64 0 V440 Z" fill="${t.cap[1]}"/>
    <rect x="322" y="520" width="26" height="300" rx="13" fill="url(#${id}h)"/>
    ${label(t, 330, 610, 140, 150, 0.9)}`,
  jar: (id, t) => `
    <rect x="220" y="650" width="360" height="210" rx="40" fill="url(#${id}b)"/>
    <rect x="210" y="575" width="380" height="88" rx="20" fill="url(#${id}c)"/>
    <rect x="240" y="668" width="30" height="170" rx="15" fill="url(#${id}h)"/>
    ${label(t, 320, 690, 160, 140, 0.95)}`,
  tube: (id, t) => `
    <path d="M290 330 H510 L486 780 H314 Z" fill="url(#${id}b)"/>
    <rect x="286" y="318" width="228" height="22" rx="4" fill="${t.body[1]}" opacity=".85"/>
    <rect x="330" y="780" width="140" height="80" rx="14" fill="url(#${id}c)"/>
    <path d="M312 350 H340 L330 760 H318 Z" fill="url(#${id}h)"/>
    ${label(t, 330, 470, 140, 160, 0.9)}`,
  pump: (id, t) => `
    <rect x="290" y="430" width="220" height="430" rx="34" fill="url(#${id}b)"/>
    <rect x="356" y="380" width="88" height="56" rx="8" fill="url(#${id}c)"/>
    <rect x="390" y="318" width="20" height="64" fill="${t.cap[1]}"/>
    <path d="M356 298 H470 a10 10 0 0 1 10 10 V318 H470 L520 322 V334 H356 Z" fill="url(#${id}c)"/>
    <rect x="312" y="452" width="28" height="380" rx="14" fill="url(#${id}h)"/>
    ${label(t, 330, 560, 140, 170, 0.9)}`,
  mist: (id, t) => `
    <rect x="315" y="410" width="170" height="450" rx="80" fill="url(#${id}b)"/>
    <path d="M352 410 V360 a48 48 0 0 1 96 0 V410 Z" fill="url(#${id}c)"/>
    <rect x="338" y="440" width="24" height="380" rx="12" fill="url(#${id}h)"/>
    ${label(t, 335, 560, 130, 160, 0.82)}`,
};

const shadow = (cx = 400, cy = 866, rx = 190) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="20" fill="#2B211D" opacity=".12"/>`;

const productSvg = (form, toneName) => {
  const t = TONES[toneName];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Maison Aura ${form} in ${toneName}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.bg[0]}"/><stop offset="1" stop-color="${t.bg[1]}"/></linearGradient>
      ${defs("v", t)}
    </defs>
    <rect width="800" height="1000" fill="url(#bg)"/>
    <circle cx="400" cy="520" r="300" fill="#fff" opacity=".28"/>
    ${shadow()}
    ${VESSELS[form]("v", t)}
  </svg>`;
};

const textureSvg = (toneName) => {
  const t = TONES[toneName];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Product texture swatch">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.bg[0]}"/><stop offset="1" stop-color="${t.bg[1]}"/></linearGradient>
      <radialGradient id="cr" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFDF9"/><stop offset=".7" stop-color="${toneName === "claret" ? "#E9C9C4" : t.body[0]}"/><stop offset="1" stop-color="${toneName === "claret" ? "#C98D93" : t.body[1]}"/></radialGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#bg)"/>
    <path d="M190 560 C170 420 300 330 420 350 C560 372 650 450 620 580 C596 690 470 720 380 700 C300 682 205 660 190 560 Z" fill="url(#cr)"/>
    <path d="M300 470 C350 420 470 420 520 480" stroke="#fff" stroke-width="16" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M330 560 C380 600 470 600 540 560" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".45"/>
    <circle cx="560" cy="430" r="14" fill="#fff" opacity=".8"/>
  </svg>`;
};

/** A vessel scaled and positioned within a larger scene. */
const placed = (form, toneName, id, x, scale) =>
  `<g transform="translate(${x} ${860 - 860 * scale}) scale(${scale})"><defs>${defs(id, TONES[toneName])}</defs>${shadow(400, 866, 170)}${VESSELS[form](id, TONES[toneName])}</g>`;

const CATEGORY_SCENES = {
  cleansers: [["tube", "blush"], ["pump", "ivory"], ["tube", "sand"]],
  toners: [["mist", "ivory"], ["mist", "claret"], ["mist", "blush"]],
  serums: [["dropper", "sand"], ["dropper", "claret"], ["dropper", "ivory"]],
  moisturisers: [["pump", "ivory"], ["jar", "blush"], ["jar", "claret"]],
  masks: [["jar", "sand"], ["tube", "claret"], ["jar", "ivory"]],
  "eye-care": [["dropper", "blush"], ["tube", "ivory"], ["dropper", "claret"]],
  body: [["pump", "sand"], ["pump", "claret"], ["tube", "ivory"]],
  suncare: [["tube", "sand"], ["mist", "ivory"], ["tube", "blush"]],
};

const categorySvg = (slug, scene) => {
  const bg = TONES[scene[1][1]].bg;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${slug} collection">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
    <rect width="800" height="1000" fill="url(#bg)"/>
    <path d="M160 1000 V420 a240 240 0 0 1 480 0 V1000 Z" fill="#fff" opacity=".35"/>
    <rect x="80" y="860" width="640" height="140" fill="#2B211D" opacity=".05"/>
    ${placed(scene[0][0], scene[0][1], "a", -125, 0.62)}
    ${placed(scene[2][0], scene[2][1], "c", 300, 0.62)}
    ${placed(scene[1][0], scene[1][1], "b", 52, 0.86)}
  </svg>`;
};

const heroSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Maison Aura signature collection">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EFE3D3"/><stop offset="1" stop-color="#E2D0BA"/></linearGradient>
    <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A2335"/><stop offset="1" stop-color="#4E1220"/></linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg)"/>
  <path d="M130 1000 V380 a270 270 0 0 1 540 0 V1000 Z" fill="url(#arch)"/>
  <path d="M170 1000 V390 a230 230 0 0 1 460 0 V1000" fill="none" stroke="#D9C7AE" stroke-width="1.5" opacity=".6"/>
  <circle cx="610" cy="210" r="46" fill="#F6EDE3" opacity=".9"/>
  <rect x="90" y="860" width="620" height="140" fill="#E9DCCB"/>
  <rect x="90" y="852" width="620" height="12" fill="#D9C7AE"/>
  ${placed("jar", "ivory", "a", -45, 0.6)}
  ${placed("pump", "blush", "c", 275, 0.66)}
  ${placed("dropper", "sand", "b", 60, 0.9)}
</svg>`;

const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" role="img" aria-label="Maison Aura">
  <text x="120" y="32" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="26" letter-spacing="7" fill="#6E1E2E">MAISON AURA</text>
</svg>`;

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#6E1E2E"/>
  <path d="M156 512 V250 a100 100 0 0 1 200 0 V512" fill="none" stroke="#E6D5BC" stroke-width="10"/>
  <text x="256" y="330" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="190" fill="#FAF6F0">A</text>
</svg>`;

for (const form of Object.keys(VESSELS)) {
  for (const tone of Object.keys(TONES)) write(`images/products/${form}-${tone}.svg`, productSvg(form, tone));
}
for (const tone of Object.keys(TONES)) write(`images/products/texture-${tone}.svg`, textureSvg(tone));
for (const [slug, scene] of Object.entries(CATEGORY_SCENES)) write(`images/categories/${slug}.svg`, categorySvg(slug, scene));
write("images/banners/hero.svg", heroSvg());
write("logo.svg", logoSvg);
write("icons/icon.svg", iconSvg);

console.log("Artwork generated in /public");
