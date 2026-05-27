import React from "react";

type Props = {
  label?:    string;
  sublabel?: string;
  onUpload:  () => void;
};

const S = {
  btn: {
    position:       "absolute",
    inset:          0,
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    background:     "none",
    border:         "none",
    cursor:         "pointer",
    width:          "100%",
    height:         "100%",
  } satisfies React.CSSProperties,

  icon: {
    opacity: 0.4,
    color:   "var(--heatmap-accent, #3b82f6)",
  } satisfies React.CSSProperties,

  label: {
    fontSize:   13,
    fontWeight: 500,
    color:      "#6b7280",
  } satisfies React.CSSProperties,

  sublabel: {
    fontSize: 11,
    color:    "#9ca3af",
  } satisfies React.CSSProperties,
} as const;

export function MapEmptyState({ label, sublabel, onUpload }: Props) {
  return (
    <button
      type="button"
      style={S.btn}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onUpload(); }}
    >
      <svg
        style={S.icon}
        width={40} height={40}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>

      <span style={S.label}>
        {label ?? "Import an image"}
      </span>

      <span style={S.sublabel}>
        {sublabel ?? "Click or drag an image here"}
      </span>
    </button>
  );
}