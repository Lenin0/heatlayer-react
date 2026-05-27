import React from "react";

const canvasStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
};

type HeatmapCanvasProps = React.ComponentPropsWithoutRef<"canvas">;

export const HeatmapCanvas = React.forwardRef<
  HTMLCanvasElement,
  HeatmapCanvasProps
>(function HeatmapCanvas(
  props: HeatmapCanvasProps,
  ref: React.ForwardedRef<HTMLCanvasElement>
) {
  return (
    <canvas
      {...props}
      ref={ref}
      style={{
        ...canvasStyle,
        ...props.style,
      }}
    />
  );
});