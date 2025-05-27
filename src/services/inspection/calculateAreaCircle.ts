export function calculateAreaCircle(radius: number) {
  if (radius <= 0) {
    return 0;
  }

  const area = Math.PI * Math.pow(radius, 2);
  return parseFloat(area.toFixed(2));
}