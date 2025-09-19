import { Card  } from "@mantine/core";
import type {CardProps}from "@mantine/core"

/**
 * Tarjeta con:
 * - background degradado suave (no blanco plano)
 * - borde glow degradado (indigo→pink)
 * - sombra profunda
 */
export default function GlowCard(props: CardProps) {
  return (
    <Card
      {...props}
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(255,255,255,.95), rgba(248,249,255,.92))",
        borderRadius: 16,
        boxShadow: "0 18px 48px rgba(16,24,40,.12)",
        ...props.style,
      }}
    >
      {/* Borde glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -1,
          zIndex: -1,
          borderRadius: 18,
          padding: 2,
          background:
            "linear-gradient(135deg, rgba(99,102,241,.75), rgba(236,72,153,.7))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          filter: "blur(0.2px)",
        }}
      />
      {props.children}
    </Card>
  );
}
