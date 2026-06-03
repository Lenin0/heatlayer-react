import React, { useState } from "react";
import type { MarkerItemProps } from "../types";
import { MarkerPin } from "./marker.pin";
import { Tooltip } from "../tooltip/tooltip";

const S = {
  root: {
    position: "absolute",
    zIndex: 10,
    cursor: "pointer",
    transform: "translate(-50%, -50%)",
  } satisfies React.CSSProperties,

  tooltip: {
    transition: "opacity 0.15s, transform 0.15s",
  } satisfies React.CSSProperties,
} as const;

export function MarkerItem({
  point,
  index,
  x,
  y,
  active = false,
  renderTooltip,
  onClick,
}: MarkerItemProps) {
  const [hovered, setHovered] = useState(false);

  const showTooltip = hovered || point.showLabel === true;

  return (
    <div
      style={{
        ...S.root,
        left: x,
        top: y,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div
        style={{
          ...S.tooltip,
          opacity: showTooltip ? 1 : 0,
          transform: showTooltip ? "translateY(0)" : "translateY(4px)",
        }}
      >
        {
          renderTooltip ? (
            renderTooltip(point, index) 
          ) : (
            <Tooltip point={point} index={index} />
          ) 
        }
      </div>

      <MarkerPin
        point={point}
        index={index}
        isActive={active}
        isHovered={hovered}
      />
    </div>
  );
}
