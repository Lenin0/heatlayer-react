import React from "react";
import { ZoomIn, ZoomOut, Maximize2, Upload } from "lucide-react";
import type { ControlsProps, Pan } from "./types";

const S = {
  controlsWrap: {
    position: "absolute",
    bottom: 8,
    right: 8,
    zIndex: 20,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  } satisfies React.CSSProperties,

  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    color: "#4b5563",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    padding: 0,
  } satisfies React.CSSProperties,

  zoomLabel: {
    textAlign: "center",
    fontSize: 9,
    color: "#9ca3af",
    background: "rgba(255,255,255,0.8)",
    borderRadius: 4,
    padding: "1px 4px",
  } satisfies React.CSSProperties,

  swapBtn: {
    position: "absolute",
    bottom: 8,
    left: 8,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 8px",
    borderRadius: 6,
    border: "none",
    background: "rgba(255,255,255,0.8)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
    fontSize: 10,
    color: "#6b7280",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
  } satisfies React.CSSProperties,
} as const;

export function HeatmapControls({
  zoom,
  minZoom,
  maxZoom,
  pan,
  onZoomIn,
  onZoomOut,
  onReset,
  onSwap,
  isPlacing,
  labels,
}: ControlsProps) {
  const isReset =
    Math.abs(zoom - 1) < 0.001 &&
    Math.abs(pan.x) < 0.001 &&
    Math.abs(pan.y) < 0.001;

  return (
    <>
      <div style={S.controlsWrap}>
        <button
          type="button"
          style={{ ...S.btn, opacity: zoom >= maxZoom ? 0.4 : 1 }}
          disabled={zoom >= maxZoom}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onZoomIn();
          }}
        >
          <ZoomIn size={16} />
        </button>

        <button
          type="button"
          style={{ ...S.btn, opacity: zoom <= minZoom ? 0.4 : 1 }}
          disabled={zoom <= minZoom}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onZoomOut();
          }}
        >
          <ZoomOut size={16} />
        </button>

        <button
          type="button"
          style={{ ...S.btn, opacity: isReset ? 0.4 : 1 }}
          disabled={isReset}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onReset();
          }}
        >
          <Maximize2 size={14} />
        </button>

        <div style={S.zoomLabel}>{Math.round(zoom * 100)}%</div>
      </div>

      {!isPlacing && onSwap && (
        <button
          type="button"
          style={S.swapBtn}
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onSwap();
          }}
        >
          <Upload size={12} />
          {labels ?? "Swap image"}
        </button>
      )}
    </>
  );
}
