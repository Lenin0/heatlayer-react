import React from "react";

import type { HeatmapPoint, TooltipField } from "../types";
import { resolveTooltipValue } from "../utils";

function TooltipRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <span style={{ color: "#9ca3af", fontSize: 11 }}>{label}</span>
      <span style={{ fontWeight: 500, color: "#374151", fontSize: 11, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export function TooltipContent({
  point,
  index,
}: {
  point: HeatmapPoint;
  index: number;
}) {
  const color = point.color ?? "#111827";
  const value = point.value ?? "—";

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.97)", minWidth: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: color }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {point.label || `Sensor ${index + 1}`}
        </span>
      </div>

      <div style={{ padding: "6px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {point.tooltipLabel?.map((field: TooltipField, fieldIndex: number) => (
          <TooltipRow
            key={fieldIndex}
            label={field.label}
            value={resolveTooltipValue(field, point, index)}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 4, paddingTop: 4, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ color: "#9ca3af", fontSize: 11 }}>Value</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color }}>{value}</span>
            {point.value == null && <span style={{ fontSize: 9, color: "#d1d5db", fontStyle: "italic" }}>preview</span>}
          </div>
        </div>
      </div>
    </div>
  );
}