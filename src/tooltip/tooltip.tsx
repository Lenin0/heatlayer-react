import React from "react";

import type { TooltipProps } from "../types";
import { usePlacement } from "./tooltip.hook";
import { getTooltipStyles } from "./tooltip.styles";
import { resolveTooltipValue } from "../utils";

const S = {
  wrapper: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 20,
  } satisfies React.CSSProperties,

  card: {
    background: "rgba(255,255,255,0.97)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 11,
    boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  } satisfies React.CSSProperties,

  header: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
  } satisfies React.CSSProperties,

  dot: {
    width: 8,
    height: 8,
    borderRadius: "9999px",
    background: "rgba(255,255,255,0.7)",
    flexShrink: 0,
  } satisfies React.CSSProperties,

  title: {
    fontWeight: 600,
    color: "#ffffff",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies React.CSSProperties,

  body: {
    padding: "6px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  } satisfies React.CSSProperties,

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  } satisfies React.CSSProperties,

  label: {
    color: "#9ca3af",
  } satisfies React.CSSProperties,

  rowValue: {
    color: "#374151",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 80,
  } satisfies React.CSSProperties,

  dividerRow: {
    marginTop: 2,
    paddingTop: 4,
    borderTop: "1px solid rgba(0,0,0,0.06)",
  } satisfies React.CSSProperties,

  valueWrap: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  } satisfies React.CSSProperties,

  value: {
    fontWeight: 700,
    fontSize: "0.75rem",
  } satisfies React.CSSProperties,

  preview: {
    fontSize: 9,
    color: "#d1d5db",
    fontStyle: "italic",
  } satisfies React.CSSProperties,

  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    borderRadius: 999,
    padding: "2px 6px",
    fontSize: "0.6rem",
  } satisfies React.CSSProperties,
} as const;

export function Tooltip({ point, index, value }: TooltipProps) {
  const { wrapperRef, tooltipRef, place } = usePlacement(point.lat, point.lng);
  const styles = getTooltipStyles(place);

  const displayValue = value ?? point.value ?? "—";

  return (
    <div ref={wrapperRef}>
      <div ref={tooltipRef} style={{ ...S.wrapper, ...styles.wrapper }}>
        <div style={S.card}>
          <div style={{ ...S.header, background: point.color ?? "#111827" }}>
            <span style={S.dot} />

            <span style={S.title}>{point.label ?? `Point ${index + 1}`}</span>
          </div>

          <div style={S.body}>
            {point.tooltipLabel?.map((field, fieldIndex) => (
              <TooltipRow
                key={fieldIndex}
                label={field.label}
                value={resolveTooltipValue(field, point, index)}
              />
            ))}

            <div style={{ ...S.row, ...S.dividerRow }}>
              <span style={S.label}>Value</span>

              <div style={S.valueWrap}>
                <span style={{ ...S.value, color: point.color ?? "#111827" }}>
                  {displayValue}
                </span>

                {point.value == null && <span style={S.preview}>preview</span>}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            ...styles.arrow,
            position: "absolute",
            width: 0,
            height: 0,
          }}
        />
      </div>
    </div>
  );
}

function TooltipRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <div style={S.row}>
      <span style={S.label}>{label}</span>
      <span style={S.rowValue}>{value ?? "—"}</span>
    </div>
  );
}
