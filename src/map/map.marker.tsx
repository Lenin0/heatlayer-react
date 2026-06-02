import React from "react";
import { Marker, Tooltip } from "react-leaflet";

import type { WithPoints } from "../types";
import { buildMapIcon } from "./map.marker.icon";
import { TooltipContent } from "./map.tooltip";

const mapMarkersStyles = `
  .react-heatmap-chart-tooltip {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .react-heatmap-chart-tooltip::before {
    display: none !important;
  }

  @keyframes heatmap-marker-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
`;

interface OsmMarkersProps extends WithPoints {
  activePointIndex?: number;
}

export function MapMarkers({
  points,
  activePointIndex,
  onPointClick,
  renderTooltip,
}: OsmMarkersProps) {
  return (
    <>
      <style>{mapMarkersStyles}</style>

      {points.map((point, index) => {
        if (point.lat == null || point.lng == null) return null;

        const isActive = activePointIndex === index;
        const { size, divIcon } = buildMapIcon(point, index, isActive);

        return (
          <Marker
            key={point.id ?? index}
            position={[point.lat, point.lng]}
            icon={divIcon}
            zIndexOffset={isActive ? 1000 : 0}
            eventHandlers={{ click: () => onPointClick?.(index) }}
          >
            <Tooltip
              direction="top"
              offset={[0, -(size / 2 + 4)]}
              opacity={1}
              className="react-heatmap-chart-tooltip"
            >
              {renderTooltip ? (
                renderTooltip(point, index)
              ) : (
                <TooltipContent point={point} index={index} />
              )}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}