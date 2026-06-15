import React from "react";

export function SparkLine({ data, color, height = 48, labels = [], selectedIndex, onPointSelect }) {
  const values = data.filter((value) => Number.isFinite(value));
  const chartData = values.length ? values : [0];
  const max = Math.max(...chartData, 1);
  const min = 0;
  const range = max - min || 1;
  const w = chartData.length > 1 ? 100 / (chartData.length - 1) : 0;
  const points = chartData
    .map((v, i) => `${i * w},${height - ((v - min) / range) * height}`)
    .join(" ");
  const areaPoints = chartData.length > 1 ? `0,${height} ${points} 100,${height}` : `0,${height} 50,${height - ((chartData[0] - min) / range) * height} 100,${height}`;

  const canSelect = typeof onPointSelect === "function";

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points={areaPoints} fill={color + "18"} stroke="none" />
      {chartData.map((v, i) => {
        const cx = chartData.length > 1 ? i * w : 50;
        const cy = height - ((v - min) / range) * height;
        const isSelected = i === selectedIndex;
        return (
          <g
            key={i}
            role={canSelect ? "button" : undefined}
            tabIndex={canSelect ? 0 : undefined}
            aria-label={canSelect ? `View ${labels[i] || `point ${i + 1}`}: ${v}` : undefined}
            onClick={canSelect ? () => onPointSelect(i) : undefined}
            onKeyDown={canSelect ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPointSelect(i);
              }
            } : undefined}
            style={{ cursor: canSelect ? "pointer" : "default", outline: "none" }}
          >
            {canSelect && <circle cx={cx} cy={cy} r="8" fill="transparent" />}
            {isSelected && <circle cx={cx} cy={cy} r="5" fill={color + "33"} stroke={color} strokeWidth="1" />}
            <circle cx={cx} cy={cy} r={isSelected ? "3" : "2"} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
