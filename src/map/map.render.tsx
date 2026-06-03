import React, { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type { HeatmapMap } from "./map";

const HeatmapMapLazy = lazy(() =>
  import("./map").then((m) => ({ default: m.HeatmapMap }))
);

export function HeatmapMapDynamic(props: ComponentProps<typeof HeatmapMap>) {
  return (
    <Suspense fallback={<div style={{ width: "100%", height: "100%", background: "#f3f4f6" }} />}>
      <HeatmapMapLazy {...props} />
    </Suspense>
  );
}