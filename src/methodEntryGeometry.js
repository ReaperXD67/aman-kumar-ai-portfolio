// Consume the X-ray renderer's own M/L paths instead of maintaining a second
// topology. All points remain in its authored 0–100 coordinate space.
export function sampleCircuitEntry(nodes, routePaths, count = 84) {
  const paths = routePaths.map(path => Array.from(path.matchAll(/[ML]\s+(-?[\d.]+)\s+(-?[\d.]+)/g), match => [Number(match[1]), Number(match[2])]))
    .filter(points => points.length > 1);
  const segments = paths.flatMap(points => points.slice(1).map((point, index) => ({
    from: points[index], to: point, length: Math.hypot(point[0] - points[index][0], point[1] - points[index][1]),
  }))).filter(segment => segment.length > 0);
  const nodePoints = nodes.map(({ x, y }) => [x, y]);
  if (!nodePoints.length || !segments.length || count < nodePoints.length) return null;
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const remaining = count - nodePoints.length;
  const points = [...nodePoints];
  for (let index = 0; index < remaining; index += 1) {
    let distance = totalLength * (index + 0.5) / remaining;
    let segment = segments[segments.length - 1];
    for (const candidate of segments) {
      segment = candidate;
      if (distance <= segment.length) break;
      distance -= segment.length;
    }
    const ratio = Math.min(1, Math.max(0, distance / segment.length));
    points.push([segment.from[0] + (segment.to[0] - segment.from[0]) * ratio, segment.from[1] + (segment.to[1] - segment.from[1]) * ratio]);
  }
  return { points, paths, nodes: nodePoints };
}

export function fitEntryPoint(point, width, height) {
  const pad = Math.min(width, height) * 0.13;
  return [pad + point[0] / 100 * (width - pad * 2), pad + point[1] / 100 * (height - pad * 2)];
}
