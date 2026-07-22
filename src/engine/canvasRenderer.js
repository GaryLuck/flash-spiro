/**
 * Canvas Renderer Module
 * Handles drawing spirograph curves, multi-layer rendering, line styles, glow, and rainbow gradients.
 */

export class CanvasRenderer {
  constructor(drawingCanvas, activeCanvas, bgCanvas) {
    this.drawingCanvas = drawingCanvas;
    this.activeCanvas = activeCanvas;
    this.bgCanvas = bgCanvas;

    this.dCtx = drawingCanvas.getContext('2d');
    this.aCtx = activeCanvas.getContext('2d');
    this.bCtx = bgCanvas.getContext('2d');

    this.dpr = window.devicePixelRatio || 1;
    this.zoomScale = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;

    [this.drawingCanvas, this.activeCanvas, this.bgCanvas].forEach(c => {
      c.width = width * this.dpr;
      c.height = height * this.dpr;
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
    });

    this.dCtx.scale(this.dpr, this.dpr);
    this.aCtx.scale(this.dpr, this.dpr);
    this.bCtx.scale(this.dpr, this.dpr);

    this.redrawBackground();
  }

  setZoom(scale) {
    this.zoomScale = scale;
  }

  clearActiveCanvas() {
    this.aCtx.clearRect(0, 0, this.width, this.height);
  }

  clearDrawingCanvas() {
    this.dCtx.clearRect(0, 0, this.width, this.height);
  }

  redrawBackground() {
    this.bCtx.clearRect(0, 0, this.width, this.height);
    // Canvas paper background color/texture is handled via container CSS
  }

  /**
   * Render complete layer stack on drawing canvas
   * @param {Array} layers - Array of layer objects
   */
  renderLayers(layers) {
    this.clearDrawingCanvas();
    const ctx = this.dCtx;

    ctx.save();
    ctx.translate(this.width / 2 + this.panX, this.height / 2 + this.panY);
    ctx.scale(this.zoomScale, this.zoomScale);

    layers.forEach(layer => {
      if (!layer.visible || !layer.points || layer.points.length === 0) return;
      this.drawPath(ctx, layer.points, layer, layer.progress || 1.0);
    });

    ctx.restore();
  }

  /**
   * Draw active animating progress line on activeCanvas
   */
  renderActiveStroke(points, layer, progress) {
    this.clearActiveCanvas();
    const ctx = this.aCtx;

    ctx.save();
    ctx.translate(this.width / 2 + this.panX, this.height / 2 + this.panY);
    ctx.scale(this.zoomScale, this.zoomScale);

    this.drawPath(ctx, points, layer, progress);

    ctx.restore();
  }

  /**
   * Core path rendering with stroke options (Solid, Rainbow, Glow)
   */
  drawPath(ctx, points, layer, progress = 1.0) {
    const totalPoints = points.length;
    if (totalPoints < 2) return;

    const count = Math.min(totalPoints, Math.floor(totalPoints * progress));
    if (count < 2) return;

    const { color, width, opacity, penMode } = layer;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (penMode === 'glow') {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = color;
      this.drawPolyline(ctx, points, count);
    } else if (penMode === 'rainbow') {
      // Draw segmented path with dynamic HSL color interpolation
      ctx.shadowBlur = 0;
      for (let i = 0; i < count - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const hue = (i / totalPoints) * 360;
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `hsl(${hue}, 95%, 60%)`;
        ctx.stroke();
      }
    } else {
      // Solid Color
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color;
      this.drawPolyline(ctx, points, count);
    }

    ctx.restore();
  }

  drawPolyline(ctx, points, count) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < count; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
  }
}
