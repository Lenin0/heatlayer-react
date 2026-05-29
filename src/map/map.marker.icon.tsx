import L from "leaflet";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MarkerPin } from "../markers/marker.pin";
import type { HeatmapPoint } from "../types";

export function buildMapIcon(point: HeatmapPoint, index: number, isActive: boolean) {
  const size = isActive ? 26 : 22;

  const html = renderToStaticMarkup(
    React.createElement(MarkerPin, {
      point,
      index,
      isActive,
      isHovered: false,
    })
  );

  return {
    size,
    divIcon: L.divIcon({
      className:  "",
      iconSize:   [size, size],
      iconAnchor: [size / 2, size / 2],
      html,
    }),
  };
}