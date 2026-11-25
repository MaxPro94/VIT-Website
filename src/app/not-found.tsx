import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0a0a0a",
          color: "#f2f0eb",
          fontFamily: "sans-serif",
        }}
      >
        <main style={{ padding: "8rem 1.5rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 500 }}>Page not found.</h1>
          <p style={{ marginTop: "0.75rem" }}>Page introuvable.</p>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/en" style={{ color: "#e8ca69" }}>
              VIT
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
