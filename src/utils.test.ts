import { describe, it, expect } from "vitest";
import { ImageRect, Pan } from "./types";
import {
  clamp,
  getContainRect,
  clampPan,
  getDynamicColor,
  seeded,
  isOutOfBounds,
  toScreenCoords,
} from "./utils";

describe("clamp", () => {
  it("returns the value when it is within range", () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(3, 1, 5)).toBe(3);
  });

  it("returns min when the value is less than the minimum", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0, 1, 5)).toBe(1);
  });

  it("returns max when the value is greater than the maximum", () => {
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(10, 1, 5)).toBe(5);
  });

  it("returns the value when it is exactly at the lower bound", () => {
    expect(clamp(0, 0, 1)).toBe(0);
  });

  it("returns the value when it is exactly at the upper bound", () => {
    expect(clamp(1, 0, 1)).toBe(1);
  });

  it("uses min=0 and max=1 defaults when not provided", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(5)).toBe(1);
    expect(clamp(0.7)).toBe(0.7);
  });
});

describe("getContainRect", () => {
  it("bounds by width when the image is wider than the container", () => {
    const rect = getContainRect(200, 200, 400, 100);
    expect(rect.w).toBe(200);
    expect(rect.h).toBe(50); 
  });

  it("bounds by height when the image is taller than the container", () => {
    const rect = getContainRect(200, 200, 100, 400);
    expect(rect.h).toBe(200);
    expect(rect.w).toBe(50);
  });

  it("centers horizontally when bounded by height", () => {
    const rect = getContainRect(200, 200, 100, 400);
    expect(rect.y).toBe(0);
  });

  it("centers vertically when bounded by width", () => {
    const rect = getContainRect(200, 200, 400, 100);
    expect(rect.y).toBe(75);
    expect(rect.x).toBe(0);
  });

  it("fills the entire container when aspect ratios match", () => {
    const rect = getContainRect(300, 200, 600, 400);
    expect(rect.w).toBe(300);
    expect(rect.h).toBe(200);
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
  });

  it("returns positive values for any valid input", () => {
    const rect = getContainRect(1920, 1080, 800, 600);
    expect(rect.w).toBeGreaterThan(0);
    expect(rect.h).toBeGreaterThan(0);
  });
});

describe("clampPan", () => {
  it("returns pan unchanged when it is within bounds", () => {
    const result = clampPan({ x: 0, y: 0 }, 1, 200, 200);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it("clamps positive x to 0 (cannot drag right with zoom=1)", () => {
    const result = clampPan({ x: 50, y: 0 }, 1, 200, 200);
    expect(result.x).toBe(0);
  });

  it("clamps positive y to 0 (cannot drag down with zoom=1)", () => {
    const result = clampPan({ x: 0, y: 50 }, 1, 200, 200);
    expect(result.y).toBe(0);
  });

  it("allows negative pan up to -(cW * zoom - cW) when zoom=2", () => {
    const result = clampPan({ x: -200, y: 0 }, 2, 200, 200);
    expect(result.x).toBe(-200);
  });

  it("clamps pan beyond the left bound when zoom=2", () => {
    const result = clampPan({ x: -999, y: 0 }, 2, 200, 200);
    expect(result.x).toBe(-200); 
  });

  it("always returns {0, 0} regardless of input when zoom=1", () => {
    expect(clampPan({ x: -100, y: -100 }, 1, 200, 200)).toEqual({ x: 0, y: 0 });
    expect(clampPan({ x: 100, y: 100 }, 1, 200, 200)).toEqual({ x: 0, y: 0 });
  });
});

describe("getDynamicColor", () => {
  it("returns blue for intensity <= 0.2", () => {
    expect(getDynamicColor(0)).toBe("30, 78, 216");
    expect(getDynamicColor(0.2)).toBe("30, 78, 216");
  });

  it("returns green for intensity <= 0.4", () => {
    expect(getDynamicColor(0.3)).toBe("34, 197, 94");
    expect(getDynamicColor(0.4)).toBe("34, 197, 94");
  });

  it("returns yellow for intensity <= 0.6", () => {
    expect(getDynamicColor(0.5)).toBe("250, 204, 21");
    expect(getDynamicColor(0.6)).toBe("250, 204, 21");
  });

  it("returns orange for intensity <= 0.8", () => {
    expect(getDynamicColor(0.7)).toBe("249, 115, 22");
    expect(getDynamicColor(0.8)).toBe("249, 115, 22");
  });

  it("returns red for intensity > 0.8", () => {
    expect(getDynamicColor(0.9)).toBe("220, 38, 38");
    expect(getDynamicColor(1.0)).toBe("220, 38, 38");
  });

  it("inverts colors when invert=true (low intensity → red)", () => {
    expect(getDynamicColor(0, true)).toBe("220, 38, 38");
  });

  it("inverts colors when invert=true (high intensity → blue)", () => {
    expect(getDynamicColor(1, true)).toBe("30, 78, 216");
  });
});

describe("seeded", () => {
  it("returns a number between 0 and 1", () => {
    for (let i = 0; i < 20; i++) {
      const v = seeded(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic: same input, same output", () => {
    expect(seeded(42)).toBe(seeded(42));
    expect(seeded(7)).toBe(seeded(7));
  });

  it("produces different values for different inputs", () => {
    expect(seeded(1)).not.toBe(seeded(2));
    expect(seeded(10)).not.toBe(seeded(11));
  });
});
const makeRect = (x: number, y: number, w: number, h: number): ImageRect => ({ x, y, w, h });
const makePan  = (x: number, y: number): Pan => ({ x, y });

describe("toScreenCoords", () => {
  it("sensor at the center (lat=50, lng=50) → center point of imgRect", () => {
    const rect   = makeRect(0, 0, 200, 200);
    const result = toScreenCoords(50, 50, rect, 1, makePan(0, 0));

    expect(result.x).toBe(100); 
    expect(result.y).toBe(100);
  });

  it("sensor at the origin (lat=0, lng=0) → top-left corner of imgRect", () => {
    const rect   = makeRect(0, 0, 400, 300);
    const result = toScreenCoords(0, 0, rect, 1, makePan(0, 0));

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it("sensor at the opposite extreme (lat=100, lng=100) → bottom-right corner", () => {
    const rect   = makeRect(0, 0, 400, 300);
    const result = toScreenCoords(100, 100, rect, 1, makePan(0, 0));

    expect(result.x).toBe(400);
    expect(result.y).toBe(300);
  });

  it("imgRect with offset (x, y) shifts the result", () => {
    const rect   = makeRect(50, 25, 200, 150);
    const result = toScreenCoords(0, 0, rect, 1, makePan(0, 0));

    expect(result.x).toBe(50);
    expect(result.y).toBe(25); 
  });

  it("zoom=2 doubles the position of the base coordinate", () => {
    const rect   = makeRect(0, 0, 200, 200);
    const result = toScreenCoords(50, 50, rect, 2, makePan(0, 0));

    expect(result.x).toBe(200);
    expect(result.y).toBe(200);
  });

  it("pan is added after applying zoom", () => {
    const rect   = makeRect(0, 0, 200, 200);
    const result = toScreenCoords(50, 50, rect, 2, makePan(-30, -20));

    expect(result.x).toBe(170);
    expect(result.y).toBe(180);
  });

  it("zoom=0.5 cuts the position in half", () => {
    const rect   = makeRect(0, 0, 200, 200);
    const result = toScreenCoords(50, 50, rect, 0.5, makePan(0, 0));

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });

  it("lat and lng are independent of each other", () => {
    const rect   = makeRect(0, 0, 400, 200);
    const result = toScreenCoords(75, 25, rect, 1, makePan(0, 0));

    expect(result.x).toBe(100);
    expect(result.y).toBe(150);
  });
});

describe("isOutOfBounds", () => {
  it("returns false when coordinate is inside the container", () => {
    expect(isOutOfBounds(100, 100, 200, 200)).toBe(false);
  });

  it("returns false when coordinate is exactly at the origin (0, 0)", () => {
    expect(isOutOfBounds(0, 0, 200, 200)).toBe(false);
  });

  it("returns false when coordinate is exactly at the bottom-right boundary", () => {
    expect(isOutOfBounds(200, 200, 200, 200)).toBe(false);
  });

  it("returns true when x is negative", () => {
    expect(isOutOfBounds(-1, 100, 200, 200)).toBe(true);
  });

  it("returns true when y is negative", () => {
    expect(isOutOfBounds(100, -1, 200, 200)).toBe(true);
  });

  it("returns true when x exceeds container width", () => {
    expect(isOutOfBounds(201, 100, 200, 200)).toBe(true);
  });

  it("returns true when y exceeds container height", () => {
    expect(isOutOfBounds(100, 201, 200, 200)).toBe(true);
  });

  it("returns true when both x and y are negative", () => {
    expect(isOutOfBounds(-10, -10, 200, 200)).toBe(true);
  });

  it("returns true when both x and y exceed bounds", () => {
    expect(isOutOfBounds(999, 999, 200, 200)).toBe(true);
  });

  it("returns true when x is out of bounds but y is inside", () => {
    expect(isOutOfBounds(300, 100, 200, 200)).toBe(true);
  });

  it("returns true when x is inside but y is out of bounds", () => {
    expect(isOutOfBounds(100, 300, 200, 200)).toBe(true);
  });
});