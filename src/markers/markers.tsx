import React from "react";
import { toScreenCoords, isOutOfBounds } from "./../utils"
import type { MarkersProps } from "../types";
import { MarkerItem } from "./marker.item";

export function Markers({
  points,
  imgRect,
  zoom,
  pan,
  containerW,
  containerH,
  activePointIndex,
  renderTooltip,
  onPointClick,
}: MarkersProps) {
  return (
    <>
      {points.map((point, index) => {
        if (point.lat == null || point.lng == null) return null;

        const { x, y } = toScreenCoords(
          point.lat,
          point.lng,
          imgRect,
          zoom,
          pan
        );

        if (isOutOfBounds(x, y, containerW, containerH)) return null;

        return (
          <MarkerItem
            key={index}
            point={point}
            index={index}
            x={x}
            y={y}
            active={activePointIndex === index}
            onClick={() => onPointClick?.(index)}
            renderTooltip={renderTooltip}
          />
        );
      })}
    </>
  );
}