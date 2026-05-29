import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { HeatmapPoint, MapConfig } from "../types";

type Props = { points: HeatmapPoint[]; config: MapConfig };

export function MapViewController({ points, config }: Props) {
  const map        = useMap();
  const fittedRef  = useRef(false);
  const prevCenter = useRef(config.center);

  useEffect(() => {
    if (fittedRef.current) return;
    const valid = points.filter(
      (p) => p.lat != null && p.lng != null &&
             p.lat >= -90 && p.lat <= 90 &&
             p.lng >= -180 && p.lng <= 180
    );
    if (valid.length === 0) return;
    fittedRef.current = true;
    if (valid.length === 1) {
      map.flyTo([valid[0].lat!, valid[0].lng!], 16, { animate: false });
      return;
    }
    map.flyToBounds(
      L.latLngBounds(valid.map((p) => [p.lat!, p.lng!] as [number, number])),
      { padding: [60, 60], maxZoom: 18, animate: false }
    );
  }, [points, map]);

  useEffect(() => {
    if (fittedRef.current) return;
    const [prevLat, prevLng] = prevCenter.current;
    const [lat, lng]         = config.center;
    if (lat === prevLat && lng === prevLng) return;
    prevCenter.current = config.center;
    map.flyTo([lat, lng], config.zoom, { animate: true, duration: 1 });
  }, [config.center, config.zoom, map]);

  return null;
}