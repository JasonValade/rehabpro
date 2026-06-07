export function SparkLine({ data, color, height = 48 }) {
  const max = Math.max(...data);
  const min = 0;
  const range = max - min || 1;
  const w = 100 / (data.length - 1);
  const points = data
    .map((v, i) => `${i * w},${height - ((v - min) / range) * height}`)
    .join(" ");

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
      <polyline points={`0,${height} ${points} 100,${height}`} fill={color + "18"} stroke="none" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={height - ((v - min) / range) * height} r="2" fill={color} />
      ))}
    </svg>
  );
}
