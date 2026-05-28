import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { HeatmapPoint, ImageRect, Pan } from "./types";
import { clamp, clampPan, drawHeatmap, getContainRect } from "./utils";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.25;

export function useImageRect(mapImageUrl: string | undefined) {
 
  const imgNaturalRef = useRef<{ w: number; h: number } | null>(null);
  const [imgRect, setImgRect] = useState<ImageRect | null>(null);

  const computeRect = useCallback((containerW: number, containerH: number) => {
    const natural = imgNaturalRef.current;
    const rect = natural
      ? getContainRect(containerW, containerH, natural.w, natural.h)
      : { x: 0, y: 0, w: containerW, h: containerH };
    
    setImgRect(rect);
    return rect;
  }, []);

  useEffect(() => {
    imgNaturalRef.current = null;
    setImgRect(null);
  }, [mapImageUrl]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imgNaturalRef.current = { w: img.naturalWidth, h: img.naturalHeight };
  }, []);

  return { imgRect, computeRect, handleImageLoad };
}

export function useZoom(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [zoom, setZoom] = useState(1);
  const [pan,  setPan]  = useState<Pan>({ x: 0, y: 0 });

  const applyZoom = useCallback((nextZoom: number, originX?: number, originY?: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    const ox = originX ?? cW / 2;
    const oy = originY ?? cH / 2;

    setZoom((prev) => {
      const clamped = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const scale   = clamped / prev;
      setPan((prevPan) => clampPan(
        { x: ox - scale * (ox - prevPan.x), y: oy - scale * (oy - prevPan.y) },
        clamped, cW, cH
      ));
      return clamped;
    });
  }, [containerRef]);

  const zoomIn  = useCallback(() => applyZoom(zoom + ZOOM_STEP), [zoom, applyZoom]);
  const zoomOut = useCallback(() => applyZoom(zoom - ZOOM_STEP), [zoom, applyZoom]);

  const reset = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  return { zoom, pan, setPan, applyZoom, zoomIn, zoomOut, resetZoom: reset, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM };
}

export function useWheelZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  applyZoom: (nextZoom: number, originX?: number, originY?: number) => void,
  zoom: number,
  enabled = true,
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = el.getBoundingClientRect();
      const originX = e.clientX - rect.left;
      const originY = e.clientY - rect.top;
      const delta = -(e.deltaY / 1000);
      const clamped = Math.max(-ZOOM_STEP, Math.min(ZOOM_STEP, delta));

      applyZoom(zoom + clamped, originX, originY);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [containerRef, applyZoom, zoom, enabled]);
}

export function useDrag(
  containerRef: React.RefObject<HTMLDivElement | null>,
  zoom: number,
  pan: Pan,
  setPan: React.Dispatch<React.SetStateAction<Pan>>,
  isPlacingMode?: boolean
) {
  const isDragging = useRef(false);
  const dragStart  = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlacingMode) return;
    isDragging.current = true;
    dragStart.current  = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  }, [isPlacingMode, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const container = containerRef.current;
    if (!container) return;
    const dx  = e.clientX - dragStart.current.mx;
    const dy  = e.clientY - dragStart.current.my;
    setPan(clampPan(
      { x: dragStart.current.px + dx, y: dragStart.current.py + dy },
      zoom, container.offsetWidth, container.offsetHeight
    ));
  }, [zoom, containerRef, setPan]);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  return { isDragging, handleMouseDown, handleMouseMove, handleMouseUp };
}

export function useDraw(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  points: HeatmapPoint[],
  zoom: number,
  pan: Pan,
  computeRect: (w: number, h: number) => ImageRect
) {
  const sensorKey = useMemo(
    () => JSON.stringify(points.map((s) => ({
      lat: s.lat, lng: s.lng, w: s.value,
      r: s.radius, bl: s.blur, op: s.maxOpacity,
      min: s.minValue, max: s.maxValue,
    }))),
    [points]
  );

  const redraw = useCallback(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    canvas.width  = container.offsetWidth;
    canvas.height = container.offsetHeight;

    const rect = computeRect(container.offsetWidth, container.offsetHeight);
    drawHeatmap(canvas, points, rect, zoom, pan);
  }, [sensorKey, points, zoom, pan, computeRect, containerRef, canvasRef]); 

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw, containerRef]);

  return { redraw };
}

export function useFileUpload(onMapImageUpload?: (file: File) => void) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDragOver   = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if(!onMapImageUpload) return
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/") || file.type === "application/pdf") {
      onMapImageUpload(file);
    } 
  }, [onMapImageUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onMapImageUpload) onMapImageUpload(file);
  }, [onMapImageUpload]);

  const openPicker = useCallback(() => fileRef.current?.click(), []);

  return { fileRef, handleDragOver, handleDrop, handleFileChange, openPicker };
}

export function usePlaceClick(
  containerRef: React.RefObject<HTMLDivElement | null>,
  imgRect: ImageRect | null,
  zoom: number,
  pan: Pan,
  isPlacingMode?: boolean,
  onMapClick?: (lat: number, lng: number) => void,
) {
  return useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingMode || !containerRef.current || !onMapClick) return;

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const currentZoom = Number(zoom) || 1;

    if (imgRect) {
      const relX = ((rawX - pan.x) / currentZoom - imgRect.x) / imgRect.w;
      const relY = ((rawY - pan.y) / currentZoom - imgRect.y) / imgRect.h;
      if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;
      onMapClick(relY * 100, relX * 100);
    } else {
      onMapClick((rawY / rect.height) * 100, (rawX / rect.width) * 100);
    }
  }, [isPlacingMode, containerRef, imgRect, zoom, pan, onMapClick]);
}

export function useSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}