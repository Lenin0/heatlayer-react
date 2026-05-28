import React from "react";

export type ImageRect  = { x: number; y: number; w: number; h: number };
export type Pan        = { x: number; y: number };
export type HeatMode   = "image" | "map";
export type V          = "top" | "bottom";
export type H          = "left" | "center" | "right";
export type Placement  = { v: V; h: H; ready: boolean };
export type RenderTooltip = (point: HeatmapPoint, index: number) => React.ReactNode;

export type MapConfig = {
  center: [number, number];
  zoom:   number;
  radius: number;
  locked: boolean;
};

export type HeatmapPoint = {
  lat: number;
  lng: number;

  value?:           number;
  minValue?:        number;
  maxValue?:        number;

  radius?:          number;
  blur?:            number;
  maxOpacity?:      number;
  thermalGradient?: boolean;
  invertColors?:    boolean;
  startAngle?:      number;
  angleSweep?:      number;

  label?:       string;
  showLabel?:   boolean;
  color?:       string;
  borderColor?: string;
  borderWidth?: number;
  iconKey?:     string;
  icon?:        React.ComponentType<React.SVGProps<SVGSVGElement>>;

  active?: boolean;
  meta?:   Record<string, unknown>;
};

export type ControlsProps = {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  pan: Pan;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSwap?: () => void;
  isPlacing?: boolean;
  labels?: string;
};

export type TooltipProps = {
  point:  HeatmapPoint;
  index:  number;
  value?: number | string;
};

export type MarkerPinProps = {
  point:     HeatmapPoint;
  index:     number;
  isActive:  boolean;
  isHovered: boolean;
};

export type MarkerItemProps = {
  point:          HeatmapPoint;
  index:          number;
  x:              number;
  y:              number;
  active?:        boolean;
  onClick?:       () => void;
  renderTooltip?: RenderTooltip;
};

export type MarkersProps = {
  points:            HeatmapPoint[];
  imgRect:           ImageRect;
  zoom:              number;
  pan:               Pan;
  containerW:        number;
  containerH:        number;
  activePointIndex?: number;
  onPointClick?:     (index: number) => void;
  renderTooltip?:    RenderTooltip;
};

export type HeatmapImageModeProps = {
  points:            HeatmapPoint[];
  mapImageUrl?:      string;
  isPlacingMode?:    boolean;
  activePointIndex?: number;
  scrollZoom?:       boolean;
  onMapClick?:       (lat: number, lng: number) => void;
  onPointClick?:     (index: number) => void;
  onImageUpload?:    (file: File) => void;
  renderTooltip?:    RenderTooltip;
};

export type HeatmapChartProps = {
  points:            HeatmapPoint[];
  mapImageUrl?:      string;
  heatMode?:         HeatMode;
  mapConfig?:        MapConfig;
  isPlacingMode?:    boolean;
  readOnly?:         boolean;
  activePointIndex?: number;
  scrollZoom?:       boolean;
  onMapModeChange?:  (mode: HeatMode)     => void;
  mapConfigChange?:  (config: MapConfig)  => void;
  onMapClick?:       (lat: number, lng: number) => void;
  onPointClick?:     (index: number)      => void;
  onImageUpload?:    (file: File)         => void;
  renderTooltip?:    RenderTooltip;
};