import "leaflet/dist/leaflet.css";
import React from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import L from "leaflet";

import type { HeatmapMapRenderProps, MapConfig } from "../types";
import { HeatmapMapLayer }    from "./map.layer";
import { MapMarkers }         from "./map.marker";
import { MapViewController }  from "./map.controller";
import { MapClickHandler }    from "./map.clickHandler";
import { PlacingBanner }      from "../placingBanner";

delete (L.Icon.Default.prototype as any)._getIconUrl;

const S = {
  root: { position: "relative", width: "100%", height: "100%" } satisfies React.CSSProperties,
  map: (isPlacingMode?: boolean): React.CSSProperties => ({
    width: "100%", height: "100%",
    cursor: isPlacingMode ? "crosshair" : undefined,
  }),
} as const;

const DEFAULT_CONFIG: MapConfig = {
  center: [0, 0],
  zoom:   2,
  radius: 300,
  locked: false,
};

export function HeatmapMap({
  points, config = DEFAULT_CONFIG, isPlacingMode,
  activePointIndex, onMapClick, onPointClick, renderTooltip,
}: HeatmapMapRenderProps) {
  return (
    <div style={S.root}>
      <MapContainer center={config.center} zoom={config.zoom} zoomControl={false} style={S.map(isPlacingMode)}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <MapClickHandler active={isPlacingMode} onMapClick={onMapClick} />
        <MapViewController points={points} config={config} />
        <HeatmapMapLayer points={points} radiusMeters={config.radius} />
        <MapMarkers
          points={points}
          activePointIndex={activePointIndex}
          onPointClick={onPointClick}
          renderTooltip={renderTooltip}
        />
      </MapContainer>
      {isPlacingMode && <PlacingBanner />}
    </div>
  );
}