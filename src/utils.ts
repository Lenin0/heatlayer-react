import { HeatmapPoint, ImageRect, Pan, TooltipField, TooltipProps } from "./types";


export function seeded(n: number) {
  const x = Math.sin(n * 999.91) * 10000;
  return x - Math.floor(x);
}

export function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function getContainRect(cW: number, cH: number, iW: number, iH: number): ImageRect {
  const ca = cW / cH;
  const ia = iW / iH;
  let w: number, h: number;
  if (ia > ca) { w = cW; h = cW / ia; }
  else         { h = cH; w = cH * ia; }
  return { x: (cW - w) / 2, y: (cH - h) / 2, w, h };
}

export function clampPan(pan: Pan, zoom: number, cW: number, cH: number): Pan {
  const scaledW = cW * zoom;
  const scaledH = cH * zoom;
  return {
    x: clamp(pan.x, Math.min(0, cW - scaledW), 0),
    y: clamp(pan.y, Math.min(0, cH - scaledH), 0),
  };
}


const THERMAL_RAMP: [number, [number, number, number]][] = [
  [0.00, [30,  78,  216]],
  [0.25, [34,  197,  94]], 
  [0.50, [250, 204,  21]], 
  [0.75, [249, 115,  22]], 
  [1.00, [220,  38,  38]], 
];

export function sampleThermal(t: number): string {
  t = clamp(t);
  for (let i = 1; i < THERMAL_RAMP.length; i++) {
    const [t0, c0] = THERMAL_RAMP[i - 1];
    const [t1, c1] = THERMAL_RAMP[i];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      const r = Math.round(c0[0] + f * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + f * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + f * (c1[2] - c0[2]));
      return `${r}, ${g}, ${b}`;
    }
  }
  const last = THERMAL_RAMP[THERMAL_RAMP.length - 1][1];
  return last.join(", ");
}

export function getDynamicColor(i: number, invert = false) {
  const t = invert ? 1 - i : i;
  if (t <= 0.2) return "30, 78, 216";
  if (t <= 0.4) return "34, 197, 94";
  if (t <= 0.6) return "250, 204, 21";
  if (t <= 0.8) return "249, 115, 22";
  return "220, 38, 38";
}


export function addThermalStops(
  gradient: CanvasGradient,
  intensity: number,
  maxOpacity: number,
  invertColors: boolean
) {
  
  const stops: { offset: number; t: number; opacity: number }[] = invertColors
    ? [
        { offset: 0.00, t: 0,            opacity: maxOpacity        },
        { offset: 0.25, t: intensity * 0.30, opacity: maxOpacity * 0.75 },
        { offset: 0.50, t: intensity * 0.55, opacity: maxOpacity * 0.45 },
        { offset: 0.75, t: intensity * 0.80, opacity: maxOpacity * 0.18 },
        { offset: 1.00, t: intensity,     opacity: 0                 },
      ]
    : [
        { offset: 0.00, t: intensity,         opacity: maxOpacity        },
        { offset: 0.25, t: intensity * 0.80,  opacity: maxOpacity * 0.75 },
        { offset: 0.50, t: intensity * 0.55,  opacity: maxOpacity * 0.45 },
        { offset: 0.75, t: intensity * 0.30,  opacity: maxOpacity * 0.18 },
        { offset: 1.00, t: 0,                 opacity: 0                 },
      ];

  for (const s of stops) {
    gradient.addColorStop(s.offset, `rgba(${sampleThermal(s.t)}, ${s.opacity})`);
  }
}


const DEFAULTS = {
    radius:     10,
    blur:       0.15,
    maxOpacity: 0.8,
    minValue:   0,
    maxValue:   100,
  };
  
  export function drawHeatmap(
    canvas: HTMLCanvasElement,
    points: HeatmapPoint[],
    imgRect: ImageRect,
    zoom: number,
    pan: Pan
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!points.length) return;
  
    ctx.globalCompositeOperation = "lighter";
  
    points.forEach((point) => {
      if (point.lat == null || point.lng == null) return;
  
      const radius     = point.radius     ?? DEFAULTS.radius;
      const blur       = point.blur       ?? DEFAULTS.blur;
      const maxOpacity = point.maxOpacity ?? DEFAULTS.maxOpacity;
      const minValue   = point.minValue   ?? DEFAULTS.minValue;
      const maxValue   = point.maxValue   ?? DEFAULTS.maxValue;
  
      const range     = maxValue - minValue;
      const intensity = range > 0
        ? clamp((Number(point.value ?? 0) - minValue) / range)
        : 0;
  
      const baseX = imgRect.x + (point.lng / 100) * imgRect.w;
      const baseY = imgRect.y + (point.lat / 100) * imgRect.h;
      const cx    = baseX * zoom + pan.x;
      const cy    = baseY * zoom + pan.y;
  
      const finalRadius = (radius + blur * 80) * zoom;
      const gradient    = ctx.createRadialGradient(cx, cy, 0, cx, cy, finalRadius);
  
      if (point.thermalGradient) {
        addThermalStops(gradient, intensity, maxOpacity, point.invertColors ?? false);
      } else {
        const color = getDynamicColor(intensity, point.invertColors ?? false);
        gradient.addColorStop(0,    `rgba(${color}, ${maxOpacity})`);
        gradient.addColorStop(0.35, `rgba(${color}, ${maxOpacity * 0.55})`);
        gradient.addColorStop(1,    `rgba(${color}, 0)`);
      }
  
      const startDeg     = point.startAngle ?? 0;
      const sweepDeg     = point.angleSweep ?? 360;
      const isFullCircle = sweepDeg >= 360;
      const startRad     = (startDeg * Math.PI) / 180;
      const endRad       = ((startDeg + sweepDeg) * Math.PI) / 180;
  
      ctx.beginPath();
      ctx.fillStyle = gradient;
  
      if (isFullCircle) {
        ctx.arc(cx, cy, finalRadius, 0, Math.PI * 2);
      } else {
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, finalRadius, startRad, endRad);
        ctx.closePath();
      }
  
      ctx.fill();
    });
  
    ctx.globalCompositeOperation = "source-over";
  }

  export function toScreenCoords(
    lat: number, lng: number,
    imgRect: ImageRect, zoom: number, pan: Pan
  ) {
    const baseX   = imgRect.x + (lng / 100) * imgRect.w;
    const baseY   = imgRect.y + (lat / 100) * imgRect.h;
    return {
      x: baseX * zoom + pan.x,
      y: baseY * zoom + pan.y,
    };
  }
  
  export function isOutOfBounds(
    x: number, y: number,
    containerW: number, containerH: number
  ) {
    return x < 0 || x > containerW || y < 0 || y > containerH;
  }

  export function resolveTooltipValue(
    field: TooltipField,
    point: TooltipProps["point"],
    index: number
  ) {
    return typeof field.value === "function"
      ? field.value(point, index)
      : field.value;
  }