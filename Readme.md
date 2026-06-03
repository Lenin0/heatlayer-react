# react-heatmap-chart

A React component library for rendering interactive heatmaps on top of custom images or OpenStreetMap tiles.

---

## Installation

```bash
npm install react-heatmap-chart
```

### Peer dependencies

```bash
npm install react react-dom lucide-react
```

For map (OSM) mode, also install:

```bash
npm install leaflet react-leaflet
```

---

## Quick start

### Image mode

Render a heatmap on top of any uploaded image (floor plan, facility layout, etc.).

```tsx
import { HeatmapImage } from "react-heatmap-chart";

const points = [
  { lat: 30, lng: 50, value: 80, label: "Sensor A" },
  { lat: 60, lng: 70, value: 40, label: "Sensor B" },
];

export default function App() {
  return (
    <div style={{ width: 800, height: 500 }}>
      <HeatmapImage
        points={points}
        mapImageUrl="/floor-plan.png"
      />
    </div>
  );
}
```

### Map (OSM) mode

Render a heatmap over an interactive OpenStreetMap map.

```tsx
import { HeatmapMap } from "react-heatmap-chart";

const points = [
  { lat: -8.05, lng: -34.88, value: 90, label: "Station 1" },
  { lat: -8.07, lng: -34.90, value: 55, label: "Station 2" },
];

export default function App() {
  return (
    <div style={{ width: "100%", height: 600 }}>
      <HeatmapMap
        points={points}
        config={{ center: [-8.05, -34.88], zoom: 13, radius: 300, locked: false }}
      />
    </div>
  );
}
```

> **Note:** `HeatmapMap` loads Leaflet lazily via `React.lazy`. Wrap your page in a `<Suspense>` boundary if needed, or let the built-in fallback handle it.

---

## Components

### `HeatmapImage`

Renders a heatmap canvas over a background image with pan, zoom, and optional point-placement interaction.

```tsx
import { HeatmapImage } from "react-heatmap-chart";
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `points` | `HeatmapPoint[]` | **required** | Data points to render. |
| `mapImageUrl` | `string` | `undefined` | URL of the background image. When omitted an upload empty state is shown. |
| `isPlacingMode` | `boolean` | `false` | When `true` the cursor becomes a crosshair and clicks emit `onMapClick`. |
| `activePointIndex` | `number` | `undefined` | Index of the currently highlighted marker. |
| `scrollZoom` | `boolean` | `true` | Enable mouse-wheel zoom. |
| `organic` | `boolean` | `false` | Draw blobs with irregular, organic edges instead of perfect circles. |
| `renderTooltip` | `(point, index) => ReactNode` | `undefined` | Custom tooltip renderer. Falls back to the built-in card. |
| `onMapClick` | `(lat, lng) => void` | `undefined` | Called (in placing mode) with normalised coordinates `[0–100]`. |
| `onPointClick` | `(index) => void` | `undefined` | Called when a marker is clicked. |
| `onImageUpload` | `(file: File) => void` | `undefined` | Called when the user drops or picks a new image file. |

---

### `HeatmapMap`

Renders a heatmap over an interactive OpenStreetMap base layer (Leaflet).

```tsx
import { HeatmapMap } from "react-heatmap-chart";
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `points` | `HeatmapPoint[]` | **required** | Data points to render. |
| `config` | `MapConfig` | See below | Initial map center, zoom, and heatmap radius. |
| `isPlacingMode` | `boolean` | `false` | When `true` clicks emit `onMapClick` with real-world lat/lng. |
| `activePointIndex` | `number` | `undefined` | Index of the currently highlighted marker. |
| `renderTooltip` | `(point, index) => ReactNode` | `undefined` | Custom tooltip renderer. |
| `onMapClick` | `(lat, lng) => void` | `undefined` | Called with WGS-84 coordinates when the map is clicked in placing mode. |
| `onPointClick` | `(index) => void` | `undefined` | Called when a marker is clicked. |

Default `config`:

```ts
{ center: [0, 0], zoom: 2, radius: 300, locked: false }
```

---

## Data model

### `HeatmapPoint`

Every item in the `points` array must conform to this type.

```ts
type HeatmapPoint = {
  // Position (required)
  lat: number;           // Latitude (OSM) or normalised Y [0–100] (image mode)
  lng: number;           // Longitude (OSM) or normalised X [0–100] (image mode)

  // Value
  value?:     number;    // Raw reading used to derive colour intensity
  minValue?:  number;    // Lower bound for intensity mapping  (default: 0)
  maxValue?:  number;    // Upper bound for intensity mapping  (default: 100)

  // Appearance — heatmap blob
  radius?:          number;   // Base radius in arbitrary units  (default: 10)
  blur?:            number;   // Blur factor [0–1]               (default: 0.15)
  maxOpacity?:      number;   // Peak opacity [0–1]              (default: 0.8)
  thermalGradient?: boolean;  // Use blue→green→yellow→red thermal scale
  invertColors?:    boolean;  // Flip the colour direction
  startAngle?:      number;   // Arc start in degrees (full circle when omitted)
  angleSweep?:      number;   // Arc sweep in degrees (360 = full circle)

  // Appearance — marker pin
  label?:       string;
  color?:       string;       // CSS colour for the pin background and tooltip header
  borderColor?: string;       // Pin border colour   (default: #ffffff)
  borderWidth?: number;       // Pin border width px (default: 2 / 3 when active)
  icon?:        React.ComponentType<React.SVGProps<SVGSVGElement>>;  // Custom icon

  // Tooltip
  tooltipLabel?: TooltipField[];   // Extra rows shown in the tooltip card
  showLabel?:    boolean;          // Always show the tooltip (not only on hover)

  // State
  id?:     string | number;
  active?: boolean;    // When false the marker blinks
  meta?:   Record<string, unknown>;  // Arbitrary extra data
};
```

### `TooltipField`

```ts
type TooltipField = {
  label: ReactNode;
  value: ReactNode | ((point: HeatmapPoint, index: number) => ReactNode);
};
```

Static value:

```ts
{ label: "Unit", value: "°C" }
```

Dynamic value (computed from the point):

```ts
{ label: "Status", value: (point) => point.value! > 80 ? "Hot" : "Normal" }
```

### `MapConfig`

Used only by `HeatmapMap`.

```ts
type MapConfig = {
  center: [number, number];  // [lat, lng]
  zoom:   number;
  radius: number;            // Heatmap radius in metres
  locked: boolean;           // Reserved – not yet enforced by the library
};
```

---

## Colour system

### Default gradient

Each blob's colour is derived from its normalised intensity `(value - minValue) / (maxValue - minValue)`:

| Intensity | Colour |
|-----------|--------|
| ≤ 0.2 | Blue `#1e4ed8` |
| ≤ 0.4 | Green `#22c55e` |
| ≤ 0.6 | Yellow `#facc15` |
| ≤ 0.8 | Orange `#f97316` |
| > 0.8 | Red `#dc2626` |

### Thermal gradient

Enable with `thermalGradient: true`. Produces a smooth blue → green → yellow → orange → red ramp suitable for temperature or density data.

### Inverted colours

Set `invertColors: true` to flip the ramp (red = low, blue = high).

---

## Examples

### Custom tooltip

```tsx
<HeatmapImage
  points={points}
  mapImageUrl="/plan.png"
  renderTooltip={(point, index) => (
    <div style={{ background: "#fff", padding: 8, borderRadius: 6, fontSize: 12 }}>
      <strong>{point.label}</strong>
      <br />
      Temperature: {point.value}°C
    </div>
  )}
/>
```

### Point placement

```tsx
const [points, setPoints] = useState<HeatmapPoint[]>([]);

<HeatmapImage
  points={points}
  mapImageUrl="/plan.png"
  isPlacingMode={true}
  onMapClick={(lat, lng) =>
    setPoints((prev) => [...prev, { lat, lng, value: 50 }])
  }
/>
```

### Organic blobs

```tsx
<HeatmapImage points={points} mapImageUrl="/plan.png" organic />
```

### Thermal gradient with arc sector

```tsx
const points: HeatmapPoint[] = [
  {
    lat: 45, lng: 55,
    value: 72,
    thermalGradient: true,
    startAngle: 0,
    angleSweep: 180,   // Semicircle
    radius: 30,
    maxOpacity: 0.9,
  },
];
```

### Custom marker icon

```tsx
import { Flame } from "lucide-react";

const points: HeatmapPoint[] = [
  { lat: 30, lng: 50, value: 95, color: "#ef4444", icon: Flame, label: "Hot zone" },
];
```

---

## Hooks (internal)

These hooks are consumed by `HeatmapImage` internally. They are **not** part of the public API but are documented here for contributors.

| Hook | Purpose |
|------|---------|
| `useImageRect` | Computes `object-contain` layout rect for the background image. |
| `useZoom` | Manages zoom level and pan offset; provides `zoomIn`, `zoomOut`, `resetZoom`. |
| `useWheelZoom` | Attaches a passive-false wheel listener for pinch-to-zoom / scroll-zoom. |
| `useDrag` | Mouse-drag panning with clamped bounds. |
| `useDraw` | Calls `drawHeatmap` on every relevant state change and on container resize. |
| `useFileUpload` | Wires a hidden `<input type="file">` with drag-and-drop support. |
| `usePlaceClick` | Converts a raw click position to normalised image coordinates. |
| `useSize` | Tracks container dimensions via `ResizeObserver`. |

---

## Utility functions (internal)

| Function | Signature | Description |
|----------|-----------|-------------|
| `getContainRect` | `(cW, cH, iW, iH) → ImageRect` | Calculates the `object-contain` bounding rect. |
| `clampPan` | `(pan, zoom, cW, cH) → Pan` | Prevents panning beyond the zoomed canvas boundary. |
| `clamp` | `(v, min?, max?) → number` | Generic numeric clamp (`[0,1]` by default). |
| `drawHeatmap` | `(canvas, points, imgRect, zoom, pan, organic?) → void` | Core canvas renderer for image mode. |
| `drawHeatmapOSM` | `(canvas, points, radiusMeters, map) → void` | Core canvas renderer for OSM mode. |
| `metersToPixels` | `(meters, lat, zoom) → number` | Converts a metric radius to canvas pixels at the current Leaflet zoom. |
| `toScreenCoords` | `(lat, lng, imgRect, zoom, pan) → {x, y}` | Maps normalised point coordinates to canvas pixels. |
| `isOutOfBounds` | `(x, y, cW, cH) → boolean` | Returns true when a screen position lies outside the container. |
| `sampleThermal` | `(t) → string` | Returns an `"r, g, b"` string sampled from the thermal colour ramp. |
| `getDynamicColor` | `(i, invert?) → string` | Returns a stepped `"r, g, b"` string from the five-step colour scale. |
| `resolveTooltipValue` | `(field, point, index) → ReactNode` | Resolves a `TooltipField` value (static or callback). |

---

## TypeScript exports

All public types are re-exported from the package root:

```ts
import type {
  HeatmapPoint,
  HeatmapChartProps,
  HeatmapImageModeProps,
  MapConfig,
  HeatMode,
  RenderTooltip,
  ImageRect,
  Pan,
} from "react-heatmap-chart";
```

---

## Changelog

### 0.1.0

- Initial release.
- `HeatmapImage` — canvas heatmap over a custom image with pan/zoom.
- `HeatmapMap` — canvas heatmap over an OpenStreetMap base layer (Leaflet).
- Thermal gradient and organic blob shape options.
- Customisable marker pins with icon support.
- Built-in tooltip card with configurable extra fields.
- Point-placement mode for both image and map variants.