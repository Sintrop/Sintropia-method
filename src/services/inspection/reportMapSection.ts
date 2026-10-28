/**
 * Snapshot of the report map (area outline, samplings, trees and
 * biodiversity) for the PDF reports. Empty when the snapshot failed, so the
 * report is still generated without it.
 */
export function reportMapSection(mapImage?: string, showLegend = true) {
  if (!mapImage) return '';

  const legend = showLegend
    ? `
      <div class="map-legend">
        <span><i class="dot dot-area"></i>Regeneration area</span>
        <span><i class="dot dot-sampling"></i>Samplings</span>
        <span><i class="dot dot-tree"></i>Trees</span>
        <span><i class="dot dot-bio"></i>Biodiversity</span>
      </div>`
    : '';

  return `
    <style>
      .area-map { width: 100%; max-height: 520px; object-fit: contain; border-radius: 12px; margin-top: 20px; }
      .map-legend { display: flex; flex-wrap: wrap; gap: 16px; font-size: 12px; margin-top: 8px; }
      .map-legend .dot { -webkit-print-color-adjust: exact; print-color-adjust: exact; display: inline-block; width: 10px; height: 10px; border-radius: 5px; margin-right: 4px; border: 1px solid #000; }
      .dot-area { background: red; }
      .dot-sampling { background: rgb(0, 150, 255); }
      .dot-tree { background: #22c55e; }
      .dot-bio { background: #eab308; }
    </style>
    <img src="${mapImage}" class="area-map" />
    ${legend}
  `;
}
