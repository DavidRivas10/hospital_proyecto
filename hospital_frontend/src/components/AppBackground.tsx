import { Box } from "@mantine/core";

/**
 * Fondo con:
 * - 2 blobs radiales (indigo / pink)
 * - malla suave (mesh) en diagonal
 * - grid punteado sutil
 * - viñeta para profundidad
 */
export default function AppBackground() {
  return (
    <Box
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background:
          // blobs
          "radial-gradient(900px 600px at -10% -10%, rgba(99,102,241,.18), transparent 60%)," +
          "radial-gradient(900px 600px at 120% 0%, rgba(236,72,153,.16), transparent 55%)," +
          // mesh diagonal
          "linear-gradient(135deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.85) 40%, rgba(250,250,255,.86) 100%)",
      }}
    >
      {/* grid dotted */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.25,
          backgroundImage:
            "radial-gradient(rgba(20,20,40,.10) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          maskImage: "radial-gradient(circle at 50% 30%, black 60%, transparent 100%)",
        }}
      />
      {/* noise */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.6'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "300px 300px",
        }}
      />
      {/* viñeta */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(1200px 600px at 50% 10%, transparent 40%, rgba(0,0,0,.06) 100%)",
        }}
      />
    </Box>
  );
}
