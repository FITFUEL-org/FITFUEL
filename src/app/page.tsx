export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#0b0b0f",
        color: "#ff3b3b",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "16px",
      }}
    >
      <h1 style={{ fontSize: "clamp(3rem, 14vw, 10rem)", fontWeight: 900, letterSpacing: "0.04em", margin: 0 }}>
        GAND MARALE
      </h1>
    </main>
  );
}
