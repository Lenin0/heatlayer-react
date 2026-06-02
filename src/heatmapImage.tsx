import React, { useRef } from "react";
import type { HeatmapImageModeProps } from "./types";
import { HeatmapCanvas } from "./canva";
import { Markers } from "./markers/markers";
import { HeatmapControls } from "./controls";
import { MapEmptyState } from "./emptyState";
import { PlacingBanner } from "./placingBanner";

import {
  useImageRect,
  useZoom,
  useDrag,
  useDraw,
  useFileUpload,
  usePlaceClick,
  useSize,
  useWheelZoom,
} from "./hooks";

const S = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    userSelect: "none",
  } satisfies React.CSSProperties,

  input: {
    display: "none",
  } satisfies React.CSSProperties,

  imageWrap: {
    position: "absolute",
    inset: 0,
    transformOrigin: "0 0",
    willChange: "transform",
  } satisfies React.CSSProperties,

  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "contain",
  } satisfies React.CSSProperties,
} as const;

export default function HeatmapImage({
  points,
  mapImageUrl,
  isPlacingMode,
  activePointIndex,
  scrollZoom = true,
  organic = false,
  renderTooltip,
  onMapClick,
  onPointClick,
  onImageUpload,
}: HeatmapImageModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { w: containerW, h: containerH } = useSize(containerRef);
  const { imgRect, computeRect, handleImageLoad } = useImageRect(mapImageUrl);

  const { zoom, pan, applyZoom, setPan, zoomIn, zoomOut, resetZoom, MIN_ZOOM, MAX_ZOOM } =
    useZoom(containerRef);

  const { isDragging, handleMouseDown, handleMouseMove, handleMouseUp } =
    useDrag(containerRef, zoom, pan, setPan, isPlacingMode);

  const { fileRef, handleDragOver, handleDrop, handleFileChange, openPicker } =
    useFileUpload(onImageUpload);

  useDraw(containerRef, canvasRef, points, zoom, pan, organic, computeRect);
  useWheelZoom(containerRef, applyZoom, zoom, scrollZoom && !isPlacingMode);

  const handleClick = usePlaceClick(
    containerRef,
    imgRect,
    zoom,
    pan,
    isPlacingMode,
    onMapClick
  );

  const cursor = isPlacingMode
    ? "crosshair"
    : isDragging.current
    ? "grabbing"
    : zoom > 1
    ? "grab"
    : "default";



  return (
    <div
      ref={containerRef}
      data-heatmap-container
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        ...S.container,
        cursor,
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        style={S.input}
        onChange={handleFileChange}
      />

      {mapImageUrl ? (
        <div
          style={{
            ...S.imageWrap,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <img
            src={mapImageUrl}
            alt="Heatmap background"
            draggable={false}
            style={S.image}
            onLoad={handleImageLoad}
          />
        </div>
      ) : (
        <MapEmptyState onUpload={openPicker} />
      )}

      <HeatmapCanvas ref={canvasRef} />

      {mapImageUrl && (
        <HeatmapControls
          zoom={zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          pan={pan}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetZoom}
          onSwap={onImageUpload ? openPicker : undefined}
        />
      )}

      {isPlacingMode && <PlacingBanner />}

      {imgRect && (
        <Markers
          points={points}
          imgRect={imgRect}
          zoom={zoom}
          pan={pan}
          containerW={containerW}
          containerH={containerH}
          activePointIndex={activePointIndex}
          onPointClick={onPointClick}
          renderTooltip={renderTooltip}
        />
      )}
    </div>
  );
}
