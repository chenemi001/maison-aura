"use client";

/** Last-resort boundary for errors thrown by the root layout itself. */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en-NG">
      <body style={{ fontFamily: "Georgia, serif", background: "#faf6f0", color: "#2b211d", textAlign: "center", padding: "6rem 1rem" }}>
        <h1 style={{ fontWeight: 500 }}>Maison Aura is momentarily unavailable</h1>
        <p>Please try again in a moment.</p>
        <button
          type="button"
          onClick={() => retry()}
          style={{ marginTop: 24, padding: "12px 28px", borderRadius: 999, border: 0, background: "#6e1e2e", color: "#fffdf9", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
