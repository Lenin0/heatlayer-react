import React from "react";
import type { MarkerPinProps } from "../types";

const S = {
  dot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "9999px",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 9,
    boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
    transition: "transform 0.15s",
  } satisfies React.CSSProperties,
} as const;

export function MarkerPin({
  point,
  index,
  isActive,
  isHovered,
}: MarkerPinProps) {
  const size = isActive ? 26 : 22;
  const Icon = point.icon;
  const iconSize = size * 0.55;
  const isInactive = point.active === false;

  return (
    <div
      style={{
        ...S.dot,
        width: size,
        height: size,
        background: point.color ?? "#111827",
        border: `${point.borderWidth ?? (isActive ? 3 : 2)}px solid ${
          point.borderColor ?? "#ffffff"
        }`,
        transform: isHovered ? "scale(1.25)" : "scale(1)",
        animation: isInactive
          ? "heatmap-marker-blink 1.4s ease-in-out infinite"
          : "none",
      }}
    >
      {Icon ? (
        <Icon style={{ width: iconSize, height: iconSize }} />
      ) : (
        index + 1
      )}
    </div>
  );
}