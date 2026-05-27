import { Placement } from "../types";
import {
  TOOLTIP_GAP,
  TOOLTIP_ARROW_SIZE,
  TOOLTIP_MARKER_SIZE,
} from "./tooltip.hook";

export function getTooltipStyles(place: Placement) {
  const pos: React.CSSProperties =
    place.v === "top"
      ? { bottom: `calc(100% + ${TOOLTIP_GAP}px)` }
      : { top: `${TOOLTIP_MARKER_SIZE + TOOLTIP_GAP}px` };

  const align: React.CSSProperties =
    place.h === "center"
      ? { left: "50%", transform: "translateX(-50%)" }
      : place.h === "right"
      ? { left: 0 }
      : { right: 0 };

  const arrowV: React.CSSProperties =
    place.v === "top"
      ? {
          bottom: -TOOLTIP_ARROW_SIZE,
          borderTop: `${TOOLTIP_ARROW_SIZE}px solid rgba(255,255,255,0.97)`,
          borderBottom: "none",
        }
      : {
          top: -TOOLTIP_ARROW_SIZE,
          borderBottom: `${TOOLTIP_ARROW_SIZE}px solid rgba(255,255,255,0.97)`,
          borderTop: "none",
        };

  const arrowH: React.CSSProperties =
    place.h === "center"
      ? { left: "50%", transform: "translateX(-50%)" }
      : place.h === "right"
      ? { left: 12 }
      : { right: 12 };

  const arrow: React.CSSProperties = {
    ...arrowV,
    ...arrowH,
    borderLeft: `${TOOLTIP_ARROW_SIZE}px solid transparent`,
    borderRight: `${TOOLTIP_ARROW_SIZE}px solid transparent`,
    filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))",
  };

  const wrapper: React.CSSProperties = {
    ...pos,
    ...align,
    minWidth: 140,
    opacity: place.ready ? 1 : 0,
    transition: place.ready ? "opacity 0.1s" : "none",
  };

  return { wrapper, arrow };
}
