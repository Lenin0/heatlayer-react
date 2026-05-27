import { useLayoutEffect, useRef, useState } from "react";
import { Placement, H, V } from "../types";

const GAP         = 10;
const ARROW_SIZE  = 5;
const MARKER_SIZE = 25;

export const TOOLTIP_GAP         = GAP;
export const TOOLTIP_ARROW_SIZE  = ARROW_SIZE;
export const TOOLTIP_MARKER_SIZE = MARKER_SIZE;

export function usePlacement(lat: number | null, lng: number | null) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [place, setPlace] = useState<Placement>({
    v: "top", h: "center", ready: false,
  });

  useLayoutEffect(() => {
    const wrapper   = wrapperRef.current;
    const tooltip   = tooltipRef.current;
    if (!wrapper || !tooltip) return;

    const container = wrapper.closest("[data-heatmap-container]") as HTMLElement | null;
    if (!container) { setPlace((p) => ({ ...p, ready: true })); return; }

    const cRect = container.getBoundingClientRect();
    const mRect = wrapper.getBoundingClientRect();
    const tRect = tooltip.getBoundingClientRect();

    const cx = mRect.left + mRect.width  / 2;
    const cy = mRect.top  + mRect.height / 2;

    const spaceAbove = cy - cRect.top;
    const spaceBelow = cRect.bottom - cy;
    const spaceLeft  = cx - cRect.left;
    const spaceRight = cRect.right - cx;

    const needsHeight = tRect.height + GAP + ARROW_SIZE;
    const halfWidth   = tRect.width  / 2 + 8;

    const v: V =
      spaceAbove >= needsHeight ? "top"    :
      spaceBelow >= needsHeight ? "bottom" :
      spaceAbove >= spaceBelow  ? "top"    : "bottom";

    const h: H =
      spaceLeft  < halfWidth ? "right"  :
      spaceRight < halfWidth ? "left"   :
                               "center";

    setPlace({ v, h, ready: true });
  }, [lat, lng]);

  return { wrapperRef, tooltipRef, place };
}