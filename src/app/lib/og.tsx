import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded 1200×630 social card rendered at the edge of the cache (PNG). */
export function renderOgImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #faf6f0 0%, #e9dccb 100%)",
          color: "#2b211d",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 12, color: "#6e1e2e" }}>MAISON AURA</div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: "#6f5f52", textTransform: "uppercase" }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 76, lineHeight: 1.05 }}>{title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 28, color: "#6e1e2e" }}>
          <div style={{ display: "flex", width: 64, height: 2, background: "#6e1e2e" }} />
          {footer ?? "Luxury skincare, considered"}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
