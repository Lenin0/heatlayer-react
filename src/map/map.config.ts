import { useState, useEffect } from "react";
import { MapConfig } from "../types";


const RECIFE_CENTER: [number, number] = [-8.0476, -34.877];

export const DEFAULT_OSM_CONFIG: MapConfig = {
  center: RECIFE_CENTER,
  zoom:   13,
  radius: 300,
  locked: false,
};

export function useMapConfig(controlled?: MapConfig) {
  const [internalCfg, setInternalCfg] = useState<MapConfig>(DEFAULT_OSM_CONFIG);

  useEffect(() => {
    if (controlled) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setInternalCfg((prev) => ({
        ...prev,
        center: [pos.coords.latitude, pos.coords.longitude],
      })),
      () => {},
      { timeout: 5000 },
    );
  }, []);

  return {
    config:   controlled ?? internalCfg,
    onChange: controlled ? undefined : setInternalCfg,
  };
}