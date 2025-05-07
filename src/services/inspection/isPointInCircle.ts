
interface IsPointInCircleProps {
  point: { latitude: number, longitude: number };
  center: { latitude: number, longitude: number };
  radiusInMeters: number;
}
export function isPointInCircle({ center, point, radiusInMeters }: IsPointInCircleProps): boolean {
  //Latitude e longitude vêm em graus, mas funções trigonométricas (sin, cos) trabalham em radianos.
  //Essa função faz a conversão: graus × π ÷ 180.
  const toRad = (value: number) => (value * Math.PI) / 180;

  const R = 6371000; // raio da Terra em metros

  //Calcula a diferença entre o ponto e o centro, convertida para radianos.
  //Isso será usado na fórmula da distância esférica.
  const dLat = toRad(point.latitude - center.latitude);
  const dLon = toRad(point.longitude - center.longitude);

  //Convertendo as latitudes (do ponto e do centro) para radianos para uso no próximo cálculo.
  const lat1 = toRad(center.latitude);
  const lat2 = toRad(point.latitude);

  //Esta é a equação central da fórmula de Haversine, que estima a curvatura da Terra ao calcular a distância.
  //"a" representa o quadrado da metade da distância angular entre os dois pontos.
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  //"c" é o arco (em radianos) correspondente à distância angular entre os dois pontos.
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  //Multiplicamos c pelo raio da Terra para obter a distância em metros entre o ponto e o centro.
  const distance = R * c;

  return distance <= radiusInMeters;
}