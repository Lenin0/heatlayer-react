import { useMapEvents } from "react-leaflet";

type Props = {
  active?:     boolean;
  onMapClick?: (lat: number, lng: number) => void;
};

export function MapClickHandler({ active, onMapClick }: Props) {
  useMapEvents({
    click(e) {
      if (active && onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}