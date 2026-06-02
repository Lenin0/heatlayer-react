import React from "react";

export type ImageRect     = { x: number; y: number; w: number; h: number };
export type Pan           = { x: number; y: number };
export type HeatMode      = "image" | "map";
export type V             = "top" | "bottom";
export type H             = "left" | "center" | "right";
export type Placement     = { v: V; h: H; ready: boolean };
export type RenderTooltip = (point: HeatmapPoint, index: number) => React.ReactNode;

export type TooltipField = {
  label: React.ReactNode;
  value: React.ReactNode | ((point: HeatmapPoint, index: number) => React.ReactNode);
};

interface WithPoint {
  point: HeatmapPoint;
  index: number;
}

export interface WithPoints {
  points:            HeatmapPoint[];
  activePointIndex?: number;
  onPointClick?:     (index: number) => void;
  renderTooltip?:    RenderTooltip;
}

interface WithMapInteraction {
  isPlacingMode?: boolean;
  onMapClick?:    (lat: number, lng: number) => void;
}

interface WithZoomPan {
  zoom: number;
  pan:  Pan;
}

export type MapConfig = {
  center: [number, number];
  zoom:   number;
  radius: number;
  locked: boolean;
};

export type HeatmapPoint = {
  id?:  string | number;
  lat:  number;
  lng:  number;

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
  tooltipLabel?: TooltipField[];
  showLabel?:   boolean;
  color?:       string;
  borderColor?: string;
  borderWidth?: number;
  iconKey?:     string;
  icon?:        React.ComponentType<React.SVGProps<SVGSVGElement>>;

  active?: boolean;
  meta?:   Record<string, unknown>;
};

export interface ControlsProps extends WithZoomPan {
  minZoom:   number;
  maxZoom:   number;
  isPlacing?: boolean;
  labels?:   string;
  onZoomIn:  () => void;
  onZoomOut: () => void;
  onReset:   () => void;
  onSwap?:   () => void;
}

export interface TooltipProps extends WithPoint {
  value?: number | string;
}

export interface MarkerPinProps extends WithPoint {
  isActive:  boolean;
  isHovered: boolean;
}

export interface MarkerItemProps extends WithPoint {
  x:       number;
  y:       number;
  active?: boolean;
  onClick?: () => void;
  renderTooltip?: RenderTooltip;
}

export interface MarkersProps extends WithPoints, WithZoomPan {
  imgRect:    ImageRect;
  containerW: number;
  containerH: number;
}

export interface HeatmapImageModeProps extends WithPoints, WithMapInteraction {
  mapImageUrl?:  string;
  scrollZoom?:   boolean;
  organic?:       boolean;
  onImageUpload?: (file: File) => void;
}

export interface HeatmapMapRenderProps extends WithPoints, WithMapInteraction {
  config?:           MapConfig;
  readOnly?:       boolean;
  onConfigChange?: (cfg: MapConfig) => void;
}

export interface HeatmapChartProps extends HeatmapImageModeProps {
  heatMode?:        HeatMode;
  mapConfig?:       MapConfig;
  organic?:         boolean; 
  onMapModeChange?: (mode: HeatMode)    => void;
  mapConfigChange?: (config: MapConfig) => void;
}