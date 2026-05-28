import React from "react";
import type { HeatmapChartProps } from "./types";
import { HeatmapImageMode } from "./heatmap.imageMode";

const S = {
  root: {
    position: "relative",
    width:    "100%",
    height:   "100%",
  } satisfies React.CSSProperties,
} as const;

export default function HeatmapChart({
  points,
  mapImageUrl,
  heatMode,
  isPlacingMode,
  activePointIndex,
  readOnly = false,
  scrollZoom,
  onMapClick,
  onPointClick,
  onImageUpload,
  renderTooltip,
}: HeatmapChartProps) {
  const activeMode = heatMode ?? "image";

  if (activeMode === "map") {
    return (
      <div style={S.root}>
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
        scrollZoom={scrollZoom}
        onMapClick={onMapClick}
        onPointClick={onPointClick}
        onImageUpload={onImageUpload}
        renderTooltip={renderTooltip}
      />
    </div>
  );
}