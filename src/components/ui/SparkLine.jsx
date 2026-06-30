import React from "react";

export function SparkLine({ data, color, height = 48, labels = [], selectedIndex, onPointSelect, maxValue }) {
  const values = data.filter((value) => Number.isFinite(value));
  const chartData = values.length ? values : [0];
  const max = Number.isFinite(maxValue) ? Math.max(maxValue, 1) : Math.max(...chartData, 1);
  const min = 0;
  const range = max - min || 1;
  const w = chartData.length > 1 ? 100 / (chartData.length - 1) : 0;
  const yForValue = (value, inset = 0) => {
    const y = height - ((value - min) / range) * height;
    return Math.max(inset, Math.min(height - inset, y));
  };
  const points = chartData
    .map((v, i) => `${i * w},${yForValue(v)}`)
    .join(" ");
  const areaPoints = chartData.length > 1 ? `0,${height} ${points} 100,${height}` : "";

  const canSelect = typeof onPointSelect === "function";

  if (chartData.length === 1) {
    const value = chartData[0];
    const cy = yForValue(value, 6);

    return (
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <rect x="0" y={cy} width="100" height={height - cy} fill={color + "12"} />
        <line x1="0" y1={cy} x2="100" y2={cy} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.8" />
        <line x1="50" y1={Math.max(0, cy - 10)} x2="50" y2={height} stroke={color} strokeWidth="1" opacity="0.2" />
        <g
          role={canSelect ? "button" : undefined}
          tabIndex={canSelect ? 0 : undefined}
          aria-label={canSelect ? `View ${labels[0] || "baseline"}: ${value}` : undefined}
          onClick={canSelect ? () => onPointSelect(0) : undefined}
          onKeyDown={canSelect ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onPointSelect(0);
            }
          } : undefined}
          style={{ cursor: canSelect ? "pointer" : "default", outline: "none" }}
        >
          {canSelect && <circle cx="50" cy={cy} r="9" fill="transparent" />}
          <circle cx="50" cy={cy} r="6" fill={color + "26"} stroke={color} strokeWidth="1.5" />
          <circle cx="50" cy={cy} r="3" fill={color} />
        </g>
      </svg>
    );
  }

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
        const cy = yForValue(v);
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
