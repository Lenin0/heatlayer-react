import type { Map as LeafletMap } from "leaflet";
import { clamp, getDynamicColor, addThermalStops } from "../utils";
import type { HeatmapPoint } from "../types";

export function metersToPixels(meters: number, lat: number, zoom: number): number {
  const metersPerPx =
    (40_075_016.686 * Math.abs(Math.cos((lat * Math.PI) / 180))) / 2 ** (zoom + 8);
  return meters / metersPerPx;
}

export function drawHeatmapOSM(
  canvas: HTMLCanvasElement,
  points: HeatmapPoint[],
  radiusMeters: number,
  map: LeafletMap,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!points.length) return;

  const zoom = map.getZoom();
  ctx.globalCompositeOperation = "lighter";

  points.forEach((point) => {
    if (point.lat == null || point.lng == null) return;
    if (point.lat < -90 || point.lat > 90 || point.lng < -180 || point.lng > 180) return;

    const pointer = map.latLngToContainerPoint([point.lat, point.lng]);
    const cx = pointer.x;
    const cy = pointer.y;

    if (cx < -500 || cx > canvas.width + 500 || cy < -500 || cy > canvas.height + 500) return;

    const basePx      = metersToPixels(radiusMeters, point.lat, zoom);
    const pointRadius = point.radius ?? 10;
    const pointBlur   = point.blur   ?? 0.15;
    const finalRadius = (basePx * (pointRadius / 10)) * (1 + pointBlur * 2);

    const maxOpacity = point.maxOpacity ?? 0.8;
    const minValue   = point.minValue   ?? 0;
    const maxValue   = point.maxValue   ?? 100;
    const range      = maxValue - minValue;
    const intensity  = range > 0
      ? clamp((Number(point.value ?? 0) - minValue) / range)
      : 0;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, finalRadius);

    if (point.thermalGradient) {
      addThermalStops(gradient, intensity, maxOpacity, point.invertColors ?? false);
    } else {
      const color = getDynamicColor(intensity, point.invertColors ?? false);
      gradient.addColorStop(0,    `rgba(${color}, ${maxOpacity})`);
      gradient.addColorStop(0.35, `rgba(${color}, ${maxOpacity * 0.55})`);
      gradient.addColorStop(1,    `rgba(${color}, 0)`);
    }

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(cx, cy, finalRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
}