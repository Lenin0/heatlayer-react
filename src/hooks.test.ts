import { renderHook, act } from "@testing-library/react";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import {
  useImageRect,
  useZoom,
  useDrag,
  useDraw,
  useFileUpload,
  usePlaceClick,
} from "./hooks";

import type { Pan, ImageRect } from "./types";

vi.mock("./utils", () => ({
  drawHeatmap: vi.fn(),
  getContainRect: vi.fn(
    (cW: number, cH: number, _iW: number, _iH: number): ImageRect => ({
      x: 0,
      y: 0,
      w: cW,
      h: cH,
    })
  ),
  clamp: (v: number, min: number, max: number) =>
    Math.min(Math.max(v, min), max),
  clampPan: (pan: Pan) => pan,
}));

const resizeObserverDisconnect = vi.fn();
const resizeObserverObserve = vi.fn();

class MockResizeObserver {
  observe = resizeObserverObserve;
  disconnect = resizeObserverDisconnect;
  unobserve = vi.fn();

  constructor(_cb: ResizeObserverCallback) {}
}

globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

function makeContainerRef(w = 800, h = 600) {
  const el = document.createElement("div");

  Object.defineProperty(el, "offsetWidth", {
    configurable: true,
    value: w,
  });

  Object.defineProperty(el, "offsetHeight", {
    configurable: true,
    value: h,
  });

  Object.defineProperty(el, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      left: 0,
      top: 0,
      width: w,
      height: h,
      right: w,
      bottom: h,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
  });

  return { current: el };
}

function makeCanvasRef() {
  const canvas = document.createElement("canvas");
  return { current: canvas };
}

function mouseEvent(x: number, y: number): React.MouseEvent<HTMLDivElement> {
  return { clientX: x, clientY: y } as React.MouseEvent<HTMLDivElement>;
}

describe("useImageRect", () => {
  it("starts without imgRect", () => {
    const { result } = renderHook(() => useImageRect("http://img.png"));

    expect(result.current.imgRect).toBeNull();
  });

  it("computeRect returns fallback when image has not loaded yet", () => {
    const { result } = renderHook(() => useImageRect("http://img.png"));

    let rect!: ImageRect;

    act(() => {
      rect = result.current.computeRect(800, 600);
    });

    expect(rect).toEqual({ x: 0, y: 0, w: 800, h: 600 });
    expect(result.current.imgRect).toEqual({ x: 0, y: 0, w: 800, h: 600 });
  });

  it("computeRect uses natural dimensions after handleImageLoad", () => {
    const { result } = renderHook(() => useImageRect("http://img.png"));

    const fakeImg = { naturalWidth: 1920, naturalHeight: 1080 };

    act(() => {
      result.current.handleImageLoad({
        currentTarget: fakeImg,
      } as unknown as React.SyntheticEvent<HTMLImageElement>);
    });

    act(() => {
      result.current.computeRect(800, 600);
    });

    expect(result.current.imgRect).toEqual({ x: 0, y: 0, w: 800, h: 600 });
  });

  it("resets imgRect when URL changes", () => {
    const { result, rerender } = renderHook(({ url }) => useImageRect(url), {
      initialProps: { url: "http://img1.png" },
    });

    act(() => {
      result.current.handleImageLoad({
        currentTarget: { naturalWidth: 100, naturalHeight: 100 },
      } as unknown as React.SyntheticEvent<HTMLImageElement>);
    });

    act(() => {
      result.current.computeRect(800, 600);
    });

    expect(result.current.imgRect).not.toBeNull();

    rerender({ url: "http://img2.png" });

    expect(result.current.imgRect).toBeNull();
  });
});

describe("useZoom", () => {
  it("initial state is zoom=1 and pan={0,0}", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("zoomIn increments zoom by ZOOM_STEP", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => result.current.zoomIn());

    expect(result.current.zoom).toBeCloseTo(1 + result.current.ZOOM_STEP);
  });

  it("zoomOut decrements zoom by ZOOM_STEP", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => result.current.zoomOut());

    expect(result.current.zoom).toBeCloseTo(1 - result.current.ZOOM_STEP);
  });

  it("does not exceed MAX_ZOOM", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => result.current.applyZoom(result.current.MAX_ZOOM + 10));

    expect(result.current.zoom).toBe(result.current.MAX_ZOOM);
  });

  it("does not go below MIN_ZOOM", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => result.current.applyZoom(result.current.MIN_ZOOM - 10));

    expect(result.current.zoom).toBe(result.current.MIN_ZOOM);
  });

  it("resetZoom returns to initial state", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => {
      result.current.zoomIn();
      result.current.zoomIn();
    });

    act(() => result.current.resetZoom());

    expect(result.current.zoom).toBe(1);
    expect(result.current.pan).toEqual({ x: 0, y: 0 });
  });

  it("applyZoom with custom origin updates zoom", () => {
    const { result } = renderHook(() => useZoom(makeContainerRef()));

    act(() => result.current.applyZoom(2, 0, 0));

    expect(result.current.zoom).toBe(2);
  });

  it("containerRef null does not throw", () => {
    const ref = { current: null };

    const { result } = renderHook(() => useZoom(ref));

    expect(() => act(() => result.current.zoomIn())).not.toThrow();
  });
});

describe("useDrag", () => {
  let setPan: React.Dispatch<React.SetStateAction<Pan>>;

  beforeEach(() => {
    setPan = vi.fn() as unknown as React.Dispatch<React.SetStateAction<Pan>>;
  });

  it("calls setPan when dragging after mouseDown", () => {
    const { result } = renderHook(() =>
      useDrag(makeContainerRef(), 1, { x: 0, y: 0 }, setPan, false)
    );

    act(() => result.current.handleMouseDown(mouseEvent(100, 100)));
    act(() => result.current.handleMouseMove(mouseEvent(150, 130)));

    expect(setPan).toHaveBeenCalledTimes(1);
  });

  it("does not call setPan if mouseDown was not called before", () => {
    const { result } = renderHook(() =>
      useDrag(makeContainerRef(), 1, { x: 0, y: 0 }, setPan, false)
    );

    act(() => result.current.handleMouseMove(mouseEvent(150, 130)));

    expect(setPan).not.toHaveBeenCalled();
  });

  it("stops dragging after handleMouseUp", () => {
    const { result } = renderHook(() =>
      useDrag(makeContainerRef(), 1, { x: 0, y: 0 }, setPan, false)
    );

    act(() => result.current.handleMouseDown(mouseEvent(100, 100)));
    act(() => result.current.handleMouseUp());
    act(() => result.current.handleMouseMove(mouseEvent(200, 200)));

    expect(setPan).not.toHaveBeenCalled();
  });

  it("blocks drag when isPlacingMode=true", () => {
    const { result } = renderHook(() =>
      useDrag(makeContainerRef(), 1, { x: 0, y: 0 }, setPan, true)
    );

    act(() => result.current.handleMouseDown(mouseEvent(100, 100)));
    act(() => result.current.handleMouseMove(mouseEvent(200, 200)));

    expect(setPan).not.toHaveBeenCalled();
  });

  it("isDragging starts false", () => {
    const { result } = renderHook(() =>
      useDrag(makeContainerRef(), 1, { x: 0, y: 0 }, setPan, false)
    );

    expect(result.current.isDragging.current).toBe(false);
  });

  it("containerRef null does not throw on move", () => {
    const ref = { current: null };

    const { result } = renderHook(() =>
      useDrag(ref, 1, { x: 0, y: 0 }, setPan, false)
    );

    act(() => result.current.handleMouseDown(mouseEvent(100, 100)));

    expect(() =>
      act(() => result.current.handleMouseMove(mouseEvent(200, 200)))
    ).not.toThrow();

    expect(setPan).not.toHaveBeenCalled();
  });
});

describe("useDraw", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls drawHeatmap on mount", async () => {
    const { drawHeatmap } = await import("./utils");

    renderHook(() =>
      useDraw(
        makeContainerRef(),
        makeCanvasRef(),
        [],
        1,
        { x: 0, y: 0 },
        false,
        vi.fn(() => ({ x: 0, y: 0, w: 800, h: 600 }))
      )
    );

    expect(drawHeatmap).toHaveBeenCalledTimes(1);
  });

  it("passes organic option to drawHeatmap", async () => {
    const { drawHeatmap } = await import("./utils");

    renderHook(() =>
      useDraw(
        makeContainerRef(),
        makeCanvasRef(),
        [],
        1,
        { x: 0, y: 0 },
        true,
        vi.fn(() => ({ x: 0, y: 0, w: 800, h: 600 }))
      )
    );

    expect(drawHeatmap).toHaveBeenCalledWith(
      expect.any(HTMLCanvasElement),
      [],
      { x: 0, y: 0, w: 800, h: 600 },
      1,
      { x: 0, y: 0 },
      true
    );
  });

  it("calls drawHeatmap again when zoom changes", async () => {
    const { drawHeatmap } = await import("./utils");
    let zoom = 1;

    const { rerender } = renderHook(() =>
      useDraw(
        makeContainerRef(),
        makeCanvasRef(),
        [],
        zoom,
        { x: 0, y: 0 },
        false,
        vi.fn(() => ({ x: 0, y: 0, w: 800, h: 600 }))
      )
    );

    zoom = 2;
    rerender();

    expect(drawHeatmap).toHaveBeenCalledTimes(2);
  });

  it("registers ResizeObserver on mount and disconnects on unmount", () => {
    const { unmount } = renderHook(() =>
      useDraw(
        makeContainerRef(),
        makeCanvasRef(),
        [],
        1,
        { x: 0, y: 0 },
        false,
        vi.fn(() => ({ x: 0, y: 0, w: 800, h: 600 }))
      )
    );

    expect(resizeObserverObserve).toHaveBeenCalled();

    unmount();

    expect(resizeObserverDisconnect).toHaveBeenCalled();
  });

  it("does not throw when refs are null", () => {
    expect(() =>
      renderHook(() =>
        useDraw(
          { current: null },
          { current: null },
          [],
          1,
          { x: 0, y: 0 },
          false,
          vi.fn(() => ({ x: 0, y: 0, w: 800, h: 600 }))
        )
      )
    ).not.toThrow();
  });
});

describe("useFileUpload", () => {
  it("calls onMapImageUpload when dropping an image", () => {
    const onUpload = vi.fn();
    const { result } = renderHook(() => useFileUpload(onUpload));

    const file = new File([""], "map.png", { type: "image/png" });

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    } as unknown as React.DragEvent;

    act(() => result.current.handleDrop(dropEvent));

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("calls onMapImageUpload when dropping a PDF", () => {
    const onUpload = vi.fn();
    const { result } = renderHook(() => useFileUpload(onUpload));

    const file = new File([""], "map.pdf", { type: "application/pdf" });

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    } as unknown as React.DragEvent;

    act(() => result.current.handleDrop(dropEvent));

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("does not call onMapImageUpload when dropping a non-image and non-pdf file", () => {
    const onUpload = vi.fn();
    const { result } = renderHook(() => useFileUpload(onUpload));

    const file = new File([""], "data.csv", { type: "text/csv" });

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] },
    } as unknown as React.DragEvent;

    act(() => result.current.handleDrop(dropEvent));

    expect(dropEvent.preventDefault).toHaveBeenCalled();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it("calls onMapImageUpload when selecting a file through input", () => {
    const onUpload = vi.fn();
    const { result } = renderHook(() => useFileUpload(onUpload));

    const file = new File([""], "map.jpg", { type: "image/jpeg" });

    const changeEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => result.current.handleFileChange(changeEvent));

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it("handleDragOver calls preventDefault", () => {
    const { result } = renderHook(() => useFileUpload());

    const e = { preventDefault: vi.fn() } as unknown as React.DragEvent;

    act(() => result.current.handleDragOver(e));

    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("does not throw when dropping without onMapImageUpload defined", () => {
    const { result } = renderHook(() => useFileUpload(undefined));

    const dropEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { files: [] },
    } as unknown as React.DragEvent;

    expect(() => act(() => result.current.handleDrop(dropEvent))).not.toThrow();
  });
});

describe("usePlaceClick", () => {
  const imgRect: ImageRect = { x: 0, y: 0, w: 500, h: 500 };

  it("calls onMapClick with correct lat/lng at image center", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        imgRect,
        1,
        { x: 0, y: 0 },
        true,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(250, 250)));

    expect(onMapClick).toHaveBeenCalledWith(50, 50);
  });

  it("calls onMapClick with correct lat/lng at top-left corner", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        imgRect,
        1,
        { x: 0, y: 0 },
        true,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(0, 0)));

    expect(onMapClick).toHaveBeenCalledWith(0, 0);
  });

  it("does not call onMapClick for clicks outside image bounds", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        imgRect,
        1,
        { x: 0, y: 0 },
        true,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(-10, -10)));

    expect(onMapClick).not.toHaveBeenCalled();
  });

  it("does not call onMapClick when isPlacingMode=false", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        imgRect,
        1,
        { x: 0, y: 0 },
        false,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(250, 250)));

    expect(onMapClick).not.toHaveBeenCalled();
  });

  it("does not throw without onMapClick", () => {
    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        imgRect,
        1,
        { x: 0, y: 0 },
        true,
        undefined
      )
    );

    expect(() => act(() => result.current(mouseEvent(250, 250)))).not.toThrow();
  });

  it("uses coordinates relative to container when imgRect is null", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        null,
        1,
        { x: 0, y: 0 },
        true,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(250, 250)));

    expect(onMapClick).toHaveBeenCalledWith(50, 50);
  });

  it("considers pan and zoom when calculating coordinates", () => {
    const onMapClick = vi.fn();

    const { result } = renderHook(() =>
      usePlaceClick(
        makeContainerRef(500, 500),
        { x: 0, y: 0, w: 250, h: 250 },
        2,
        { x: 0, y: 0 },
        true,
        onMapClick
      )
    );

    act(() => result.current(mouseEvent(250, 250)));

    expect(onMapClick).toHaveBeenCalledWith(50, 50);
  });
});