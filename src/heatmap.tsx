import React from "react";
import { Map, ImageIcon } from "lucide-react";

import type { HeatmapChartProps,  HeatMode } from "./types";
import { HeatmapImageMode } from "./heatmap.imageMode";
// import { HeatmapOSMRenderDynamic } from "./osm/HeatmapOSMRenderDynamic";
// import { useOsmConfig } from "./osm/useOsmConfig";

const S = {
  root: {
    position: "relative",
    width:    "100%",
    height:   "100%",
  } satisfies React.CSSProperties,

  toggle: {
    position:     "absolute",
    top:          8,
    right:        8,
    zIndex:       20,
    display:      "flex",
    borderRadius: 6,
    overflow:     "hidden",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.15)",
    background:   "rgba(255,255,255,0.95)",
  } satisfies React.CSSProperties,

  toggleBtn: (active: boolean): React.CSSProperties => ({
    display:     "flex",
    alignItems:  "center",
    gap:         4,
    padding:     "5px 10px",
    fontSize:    10,
    fontWeight:  500,
    border:      "none",
    cursor:      "pointer",
    transition:  "background 0.15s, color 0.15s",
    background:  active ? "var(--heatmap-accent, #3b82f6)" : "transparent",
    color:       active ? "#fff" : "#6b7280",
  }),
} as const;

type Labels = {
  imageMode?: string;
  mapMode?:   string;
};

export default function HeatmapChart({
  points,
  mapImageUrl,
  heatMode,
  mapConfig:    mapConfigProp,
  isPlacingMode,
  activePointIndex,
  readOnly = false,
  onMapModeChange,
  mapConfigChange,
  onMapClick,
  onPointClick,
  onImageUpload,
  renderTooltip,
  labels,
}: HeatmapChartProps & { labels?: Labels }) {
  const activeMode = heatMode ?? "image";
//   const { config, onChange } = useOsmConfig(mapConfigProp);

  const ModeToggle = () => (
    <div style={S.toggle}>
      {(["image", "map"] as HeatMode[]).map((m) => (
        <button
          key={m}
          type="button"
          style={S.toggleBtn(activeMode === m)}
          onClick={() => onMapModeChange?.(m)}
        >
          {m === "image"
            ? <><ImageIcon size={10} />{labels?.imageMode ?? "Image"}</>
            : <><Map       size={10} />{labels?.mapMode   ?? "Map"  }</>
          }
        </button>
      ))}
    </div>
  );

  if (activeMode === "map") {
    return (
      <div style={S.root}>
        teste
        {/* <HeatmapOSMRenderDynamic
          points={points}
          config={config}
          onConfigChange={mapConfigChange ?? onChange!}
          isPlacingMode={isPlacingMode}
          activePointIndex={activePointIndex}
          onMapClick={onMapClick}
          onPointClick={onPointClick}
          renderTooltip={renderTooltip}
          readonly={readOnly}
        /> */}
        {!readOnly && <ModeToggle />}
      </div>
    );
  }

  return (
    <div style={S.root}>
      <HeatmapImageMode
        points={points}
        mapImageUrl={mapImageUrl}
        isPlacingMode={isPlacingMode}
        activePointIndex={activePointIndex}
        onMapClick={onMapClick}
        onPointClick={onPointClick}
        onImageUpload={onImageUpload}
        renderTooltip={renderTooltip}
      />
      {!readOnly && <ModeToggle />}
    </div>
  );
}