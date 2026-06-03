import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMapConfig, DEFAULT_OSM_CONFIG } from "./map.config";
import type { MapConfig } from "../types";

function mockGeolocation(lat: number, lng: number) {
  const getCurrentPosition = vi.fn((success: PositionCallback) =>
    success({
      coords: { latitude: lat, longitude: lng } as GeolocationCoordinates,
      timestamp: 0,
    } as GeolocationPosition)
  );

  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition },
    configurable: true,
  });

  return getCurrentPosition;
}

function removeGeolocation() {
  Object.defineProperty(navigator, "geolocation", {
    value: undefined,
    configurable: true,
  });
}

describe("DEFAULT_OSM_CONFIG", () => {
  it("has the correct default values", () => {
    expect(DEFAULT_OSM_CONFIG).toEqual({
      center: [-8.0476, -34.877],
      zoom:   13,
      radius: 300,
      locked: false,
    });
  });

  it("center is set to Recife coordinates", () => {
    const [lat, lng] = DEFAULT_OSM_CONFIG.center;
    expect(lat).toBeCloseTo(-8.0476, 4);
    expect(lng).toBeCloseTo(-34.877, 4);
  });
});

describe("useMapConfig", () => {
  afterEach(() => vi.restoreAllMocks());

  describe("when a controlled config is provided", () => {
    const controlled: MapConfig = {
      center: [51.505, -0.09],
      zoom:   10,
      radius: 500,
      locked: true,
    };

    it("returns the controlled config as-is", () => {
      const { result } = renderHook(() => useMapConfig(controlled));
      expect(result.current.config).toEqual(controlled);
    });

    it("returns onChange as undefined", () => {
      const { result } = renderHook(() => useMapConfig(controlled));
      expect(result.current.onChange).toBeUndefined();
    });

    it("does not call geolocation", () => {
      const spy = mockGeolocation(0, 0);
      renderHook(() => useMapConfig(controlled));
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("when no controlled config is provided and geolocation is unavailable", () => {
    beforeEach(() => removeGeolocation());

    it("returns DEFAULT_OSM_CONFIG as the initial config", () => {
      const { result } = renderHook(() => useMapConfig());
      expect(result.current.config).toEqual(DEFAULT_OSM_CONFIG);
    });

    it("returns onChange as a function", () => {
      const { result } = renderHook(() => useMapConfig());
      expect(typeof result.current.onChange).toBe("function");
    });

    it("onChange updates the config", async () => {
      const { result } = renderHook(() => useMapConfig());

      const next: MapConfig = { center: [0, 0], zoom: 5, radius: 100, locked: false };

      await act(async () => { result.current.onChange!(next); });

      expect(result.current.config).toEqual(next);
    });
  });

  describe("when no controlled config is provided and geolocation succeeds", () => {
    it("updates center to the user's position", async () => {
      mockGeolocation(-23.5505, -46.6333);

      const { result } = renderHook(() => useMapConfig());

      await act(async () => {});

      expect(result.current.config.center).toEqual([-23.5505, -46.6333]);
    });

    it("keeps zoom, radius and locked from DEFAULT_OSM_CONFIG", async () => {
      mockGeolocation(-23.5505, -46.6333);

      const { result } = renderHook(() => useMapConfig());

      await act(async () => {});

      expect(result.current.config.zoom).toBe(DEFAULT_OSM_CONFIG.zoom);
      expect(result.current.config.radius).toBe(DEFAULT_OSM_CONFIG.radius);
      expect(result.current.config.locked).toBe(DEFAULT_OSM_CONFIG.locked);
    });

    it("returns onChange as a function even after geolocation update", async () => {
      mockGeolocation(0, 0);

      const { result } = renderHook(() => useMapConfig());

      await act(async () => {});

      expect(typeof result.current.onChange).toBe("function");
    });
  });
});