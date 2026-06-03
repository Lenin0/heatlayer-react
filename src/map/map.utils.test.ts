import { describe, it, expect, vi, beforeEach } from "vitest";
import { metersToPixels, drawHeatmapOSM } from "./map.utils";
import type { HeatmapPoint } from "../types";
import type { Map as LeafletMap } from "leaflet";

function makeCtx() {
  return {
    clearRect:                  vi.fn(),
    arc:                        vi.fn(),
    fill:                       vi.fn(),
    beginPath:                  vi.fn(),
    createRadialGradient:       vi.fn().mockReturnValue({
      addColorStop: vi.fn(),
    }),
    globalCompositeOperation:   "source-over" as GlobalCompositeOperation,
    fillStyle:                  "" as string | CanvasGradient | CanvasPattern,
  };
}

function makeCanvas(width = 800, height = 600): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width  = width;
  canvas.height = height;
  return canvas;
}

function makeMap(overrides: Partial<LeafletMap> = {}): LeafletMap {
  return {
    getZoom:                  vi.fn().mockReturnValue(13),
    latLngToContainerPoint:   vi.fn().mockReturnValue({ x: 400, y: 300 }),
    ...overrides,
  } as unknown as LeafletMap;
}

function makePoint(overrides: Partial<HeatmapPoint> = {}): HeatmapPoint {
  return { lat: -8.05, lng: -34.88, value: 50, ...overrides };
}

describe("metersToPixels", () => {
  it("returns a positive number for valid inputs", () => {
    expect(metersToPixels(300, -8.05, 13)).toBeGreaterThan(0);
  });

  it("larger radius in meters → more pixels", () => {
    expect(metersToPixels(500, 0, 13)).toBeGreaterThan(metersToPixels(100, 0, 13));
  });

  it("higher zoom → more pixels for the same meter radius", () => {
    expect(metersToPixels(300, 0, 15)).toBeGreaterThan(metersToPixels(300, 0, 10));
  });

  it("higher latitude (near pole) → more pixels", () => {
    expect(metersToPixels(300, 80, 13)).toBeGreaterThan(metersToPixels(300, 0, 13));
  });

  it("returns 0 for 0 meters", () => {
    expect(metersToPixels(0, 0, 13)).toBe(0);
  });

  it("matches the Web Mercator formula at equator zoom 0 (~256px)", () => {
    expect(metersToPixels(40_075_016.686, 0, 0)).toBeCloseTo(256, 0);
  });
});

describe("drawHeatmapOSM", () => {
  let canvas: HTMLCanvasElement;
  let ctx: ReturnType<typeof makeCtx>;
  let map: LeafletMap;

  beforeEach(() => {
    canvas = makeCanvas();
    ctx    = makeCtx();
    map    = makeMap();

    vi.spyOn(canvas, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
  });

  
  it("clears the canvas and returns early when points is empty", () => {
    drawHeatmapOSM(canvas, [], 300, map);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("draws one arc for a valid point", () => {
    drawHeatmapOSM(canvas, [makePoint()], 300, map);
    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.fill).toHaveBeenCalledTimes(1);
  });

  it("restores globalCompositeOperation to source-over after drawing", () => {
    drawHeatmapOSM(canvas, [makePoint()], 300, map);
    expect(ctx.globalCompositeOperation).toBe("source-over");
  });

  it("skips a point with no lat", () => {
    drawHeatmapOSM(canvas, [makePoint({ lat: undefined as any })], 300, map);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("skips a point with no lng", () => {
    drawHeatmapOSM(canvas, [makePoint({ lng: undefined as any })], 300, map);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("skips a point with lat outside [-90, 90]", () => {
    drawHeatmapOSM(canvas, [makePoint({ lat: 91 })], 300, map);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("skips a point with lng outside [-180, 180]", () => {
    drawHeatmapOSM(canvas, [makePoint({ lng: 181 })], 300, map);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("skips a point whose screen coordinates are far outside the canvas (> +500px)", () => {
    const offMap = makeMap({
      latLngToContainerPoint: vi.fn().mockReturnValue({ x: 2000, y: 2000 }),
    });
    drawHeatmapOSM(canvas, [makePoint()], 300, offMap);
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it("does not throw when radius and blur are not provided (uses defaults)", () => {
    expect(() =>
      drawHeatmapOSM(canvas, [makePoint({ radius: undefined, blur: undefined })], 300, map)
    ).not.toThrow();
  });

  it("does not throw when value is not provided (defaults to 0)", () => {
    expect(() =>
      drawHeatmapOSM(canvas, [makePoint({ value: undefined })], 300, map)
    ).not.toThrow();
  });

  it("does not throw with thermalGradient enabled", () => {
    expect(() =>
      drawHeatmapOSM(canvas, [makePoint({ thermalGradient: true })], 300, map)
    ).not.toThrow();
  });

  it("does not throw with invertColors enabled", () => {
    expect(() =>
      drawHeatmapOSM(canvas, [makePoint({ invertColors: true })], 300, map)
    ).not.toThrow();
  });

  it("does not throw when minValue equals maxValue (zero range)", () => {
    expect(() =>
      drawHeatmapOSM(canvas, [makePoint({ minValue: 50, maxValue: 50 })], 300, map)
    ).not.toThrow();
  });

  it("draws one arc per valid point", () => {
    const points = [makePoint(), makePoint({ lat: -8.06, lng: -34.89 })];
    drawHeatmapOSM(canvas, points, 300, map);
    expect(ctx.arc).toHaveBeenCalledTimes(2);
  });

  it("skips invalid points without stopping valid ones", () => {
    const points: HeatmapPoint[] = [
      makePoint({ lat: 91 }),  
      makePoint(),             
    ];
    drawHeatmapOSM(canvas, points, 300, map);
    expect(ctx.arc).toHaveBeenCalledTimes(1);
  });
});