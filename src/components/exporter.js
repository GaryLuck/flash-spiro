/**
 * PNG and SVG Exporter for Spirograph Studio
 */

export class Exporter {
  /**
   * Export high-res PNG image
   * @param {HTMLCanvasElement} drawingCanvas
   * @param {string} bgTheme - 'studio', 'white', 'parchment', 'blueprint', 'neon', or 'transparent'
   */
  static exportPNG(drawingCanvas, bgTheme = 'studio') {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = drawingCanvas.width;
    exportCanvas.height = drawingCanvas.height;

    const ctx = exportCanvas.getContext('2d');

    // Fill background if not transparent
    if (bgTheme !== 'transparent') {
      const bgColors = {
        studio: '#0d0f17',
        white: '#ffffff',
        parchment: '#f4ecd8',
        blueprint: '#0f2b48',
        neon: '#050508'
      };
      ctx.fillStyle = bgColors[bgTheme] || '#0d0f17';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }

    // Composite drawing canvas
    ctx.drawImage(drawingCanvas, 0, 0);

    const link = document.createElement('a');
    link.download = `spirograph-${bgTheme}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Export scalable SVG vector file
   * @param {Array} layers - Array of layer objects containing polyline points
   * @param {number} width - Canvas display width
   * @param {number} height - Canvas display height
   */
  static exportSVG(layers, width = 800, height = 800) {
    const centerX = width / 2;
    const centerY = height / 2;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
    svgContent += `  <rect width="100%" height="100%" fill="#0d0f17"/>\n`;
    svgContent += `  <g transform="translate(${centerX}, ${centerY})">\n`;

    layers.forEach(layer => {
      if (!layer.visible || !layer.points || layer.points.length < 2) return;

      const pathData = layer.points.reduce((acc, pt, idx) => {
        const cmd = idx === 0 ? 'M' : 'L';
        return `${acc} ${cmd} ${pt.x.toFixed(2)},${pt.y.toFixed(2)}`;
      }, '');

      const opacity = layer.opacity || 1.0;
      const strokeWidth = layer.width || 2;
      const strokeColor = layer.color || '#3a86ff';

      svgContent += `    <path d="${pathData}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>\n`;
    });

    svgContent += `  </g>\n</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `spirograph-vector-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}
