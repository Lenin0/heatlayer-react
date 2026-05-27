import React from "react";

type Props = {
  label?: string;
};

const S: React.CSSProperties = {
  position:        "absolute",
  top:             8,
  left:            "50%",
  transform:       "translateX(-50%)",
  zIndex:          20,
  background:      "rgba(0,0,0,0.7)",
  color:           "#fff",
  fontSize:        11,
  padding:         "4px 12px",
  borderRadius:    999,
  pointerEvents:   "none",
  whiteSpace:      "nowrap",
};

export function PlacingBanner({ label }: Props) {
  return (
    <div style={S}>
      {label ?? "Click on the map to place a point"}
    </div>
  );
}