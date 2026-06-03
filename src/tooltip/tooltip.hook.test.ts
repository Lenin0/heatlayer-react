import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlacement, TOOLTIP_GAP, TOOLTIP_ARROW_SIZE, TOOLTIP_MARKER_SIZE } from "./tooltip.hook";

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    right:  left + width,
    bottom: top  + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

function mountRefs(
  result: ReturnType<typeof renderHook<ReturnType<typeof usePlacement>, [number | null, number | null]>>["result"],
  opts: {
    container?: DOMRect;
    wrapper?:   DOMRect;
    tooltip?:   DOMRect;
    withContainer?: boolean;
  } = {}
) {
  const {
    container: cRect = rect(0,   0, 800, 600),
    wrapper:   mRect = rect(390, 290,  20,  20),
    tooltip:   tRect = rect(0,   0, 140,  60),
    withContainer = true,
  } = opts;

  const containerEl = document.createElement("div");
  if (withContainer) containerEl.setAttribute("data-heatmap-container", "");
  document.body.appendChild(containerEl);

  const wrapperEl = document.createElement("div");
  containerEl.appendChild(wrapperEl);

  const tooltipEl = document.createElement("div");
  containerEl.appendChild(tooltipEl);

  Object.defineProperty(result.current.wrapperRef, "current", { value: wrapperEl, writable: true });
  Object.defineProperty(result.current.tooltipRef, "current", { value: tooltipEl, writable: true });

  vi.spyOn(containerEl, "getBoundingClientRect").mockReturnValue(cRect);
  vi.spyOn(wrapperEl,   "getBoundingClientRect").mockReturnValue(mRect);
  vi.spyOn(tooltipEl,   "getBoundingClientRect").mockReturnValue(tRect);

  return () => containerEl.remove();
}

describe("exported constants", () => {
  it("TOOLTIP_GAP is 10", ()         => expect(TOOLTIP_GAP).toBe(10));
  it("TOOLTIP_ARROW_SIZE is 5", ()   => expect(TOOLTIP_ARROW_SIZE).toBe(5));
  it("TOOLTIP_MARKER_SIZE is 25", () => expect(TOOLTIP_MARKER_SIZE).toBe(25));
});

describe("usePlacement", () => {
  afterEach(() => vi.restoreAllMocks());

  it("starts with v=top, h=center, ready=false", () => {
    const { result } = renderHook(() => usePlacement(0, 0));
    expect(result.current.place).toEqual({ v: "top", h: "center", ready: false });
  });

  it("returns wrapperRef and tooltipRef", () => {
    const { result } = renderHook(() => usePlacement(0, 0));
    expect(result.current.wrapperRef).toBeDefined();
    expect(result.current.tooltipRef).toBeDefined();
  });

  it("sets ready=true and keeps defaults when no data-heatmap-container is found", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );
  
    const teardown = mountRefs(result, { withContainer: false });
    await act(async () => { rerender({ lat: 1, lng: 1 }); });
  
    expect(result.current.place.ready).toBe(true);
    expect(result.current.place.v).toBe("top");
    expect(result.current.place.h).toBe("center");
  
    teardown();
  });

  it("places tooltip on top when there is enough space above", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,   0, 800, 600),
      wrapper:   rect(390, 490, 20, 20), 
      tooltip:   rect(0,   0, 140, 60),  
    });

    await act(async () => { rerender({ lat: 1, lng: 1 }); });

    expect(result.current.place.v).toBe("top");
    teardown();
  });

  it("places tooltip on bottom when there is not enough space above but enough below", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,  0, 800, 600),
      wrapper:   rect(390, 40, 20, 20), 
      tooltip:   rect(0,  0, 140, 60),
    });

    await act(async () => { rerender({ lat: 2, lng: 2 }); });

    expect(result.current.place.v).toBe("bottom");
    teardown();
  });

  it("falls back to top when both above and below are tight but above >= below", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,  0, 800,  70),
      wrapper:   rect(390, 30, 20, 20),
      tooltip:   rect(0,  0, 140, 60),
    });

    await act(async () => { rerender({ lat: 3, lng: 3 }); });

    expect(result.current.place.v).toBe("top");
    teardown();
  });

  it("falls back to bottom when both sides are tight but below > above", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,  0, 800,  70),
      wrapper:   rect(390, 20, 20, 20), 
      tooltip:   rect(0,  0, 140, 60),
    });

    await act(async () => { rerender({ lat: 4, lng: 4 }); });

    expect(result.current.place.v).toBe("bottom");
    teardown();
  });

  it("aligns center when there is enough space on both sides", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,   0, 800, 600),
      wrapper:   rect(390, 290, 20, 20),
      tooltip:   rect(0,   0, 140, 60),
    });

    await act(async () => { rerender({ lat: 5, lng: 5 }); });

    expect(result.current.place.h).toBe("center");
    teardown();
  });

  it("aligns right when close to the left edge", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,   0, 800, 600),
      wrapper:   rect(10, 290, 20,  20), 
      tooltip:   rect(0,   0, 140, 60),
    });

    await act(async () => { rerender({ lat: 6, lng: 6 }); });

    expect(result.current.place.h).toBe("right");
    teardown();
  });

  it("aligns left when close to the right edge", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result, {
      container: rect(0,   0,  800, 600),
      wrapper:   rect(770, 290, 20,  20), 
      tooltip:   rect(0,   0,  140,  60),
    });

    await act(async () => { rerender({ lat: 7, lng: 7 }); });

    expect(result.current.place.h).toBe("left");
    teardown();
  });

  it("sets ready=true after the layout effect runs", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result);

    await act(async () => { rerender({ lat: 8, lng: 8 }); });

    expect(result.current.place.ready).toBe(true);
    teardown();
  });

  it("re-evaluates placement when lat or lng changes", async () => {
    const { result, rerender } = renderHook(
      ({ lat, lng }: { lat: number; lng: number }) => usePlacement(lat, lng),
      { initialProps: { lat: 0, lng: 0 } }
    );

    const teardown = mountRefs(result);

    await act(async () => { rerender({ lat: 9, lng: 9 }); });
    const first = result.current.place;

    await act(async () => { rerender({ lat: 10, lng: 10 }); });
    const second = result.current.place;

    expect(first.ready).toBe(true);
    expect(second.ready).toBe(true);
    teardown();
  });
});