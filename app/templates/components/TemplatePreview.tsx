"use client";

import { LineStyle, LineAlignment } from "../interface/LineDecoration";
import { COFFEE_PALETTE } from "@/app/constants/theme";
import { SAMPLE_LINES } from "../constants";

const DEFAULT_LINE_STYLE: LineStyle = {
  fontSize: 4,
  alignment: LineAlignment.LEFT,
  isBold: false
};

/** Scale factor: template stores 1–8px; we show it larger in the UI so it's readable. */
const DEFAULT_FONT_SCALE = 10;

export interface TemplatePreviewProps {
  /** Line styles (one per receipt line). Missing entries use DEFAULT_LINE_STYLE. */
  lines: LineStyle[];
  /** Optional sample text per line; defaults to SAMPLE_LINES. */
  sampleLines?: string[];
  /** Scale factor for font size in preview (default 10). */
  fontScale?: number;
  /** Called when a line is clicked (e.g. to select for editing). */
  onLineClick?: (index: number) => void;
  /** Index of the currently selected line (for highlight). */
  selectedLineIndex?: number;
  /** Optional class for the container. */
  className?: string;
  /** Optional min height for the receipt area. */
  minHeight?: string;
}

export default function TemplatePreview({
  lines,
  sampleLines = SAMPLE_LINES,
  fontScale = DEFAULT_FONT_SCALE,
  onLineClick,
  selectedLineIndex,
  className = "",
  minHeight = "600px"
}: TemplatePreviewProps) {
  const getStyle = (lineStyle: LineStyle) => ({
    fontSize: `${(lineStyle?.fontSize ?? DEFAULT_LINE_STYLE.fontSize) * fontScale}px`,
    textAlign: (lineStyle?.alignment ?? DEFAULT_LINE_STYLE.alignment) as "left" | "center" | "right",
    fontWeight: (lineStyle?.isBold ?? DEFAULT_LINE_STYLE.isBold) ? "bold" as const : "normal" as const,
    lineHeight: "1.2",
    minHeight: "1em",
    color: COFFEE_PALETTE.textPrimary
  });

  return (
    <div
      className={`rounded-lg border-2 p-8 font-mono bg-white ${className}`}
      style={{ borderColor: COFFEE_PALETTE.border, minHeight }}
    >
      {sampleLines.map((text, index) => {
        const lineStyle = lines[index] ?? DEFAULT_LINE_STYLE;
        const isSelected = selectedLineIndex === index;
        const content = text === "" ? "\u00A0" : text;

        return (
          <div
            key={index}
            onClick={() => onLineClick?.(index)}
            className={
              onLineClick
                ? "cursor-pointer hover:bg-yellow-50 transition-colors px-2 py-1 rounded mb-1"
                : "px-0 py-0.5 mb-0.5"
            }
            style={{
              backgroundColor: isSelected ? "#FEF3C7" : "transparent"
            }}
          >
            <div style={getStyle(lineStyle)}>{content}</div>
          </div>
        );
      })}
    </div>
  );
}
