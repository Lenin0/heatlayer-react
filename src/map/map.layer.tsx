"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet"; 
import type { HeatmapPoint } from "../types";
import { drawHeatmapOSM } from "./map.utils";

type Props = {
  points:      HeatmapPoint[];
  radiusMeters: number;
};

export function HeatmapMapLayer({ points, radiusMeters }: Props) {
  const map       = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const redraw = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = map.getContainer();
    if (!canvas) return;

    const topLeft = map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(canvas, topLeft);

    canvas.width  = container.offsetWidth;
    canvas.height = container.offsetHeight;

    drawHeatmapOSM(canvas, points, radiusMeters, map);
  }, [map, points, radiusMeters]);

  const redrawRef = useRef(redraw);
  useEffect(() => { redrawRef.current = redraw; }, [redraw]);

  useEffect(() => {
    const canvas = document.createElement("canvas");

    canvas.style.cssText =
      "position:absolute;left:0;top:0;pointer-events:none;z-index:450;";
    canvasRef.current = canvas;

    const pane = map.getPane("overlayPane");
    pane?.appendChild(canvas);

    redrawRef.current();

    return () => {
      canvas.remove();
      canvasRef.current = null;
    };
  }, [map]);

  useEffect(() => { redraw(); }, [redraw, points, radiusMeters]);

  useMapEvents({ move: redraw, zoom: redraw, resize: redraw });

  return null;
}