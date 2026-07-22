/**
 * Spirograph Studio - Main Application Entry Point
 */

import { generateSpirographPath, getSpirographPoint } from './engine/spiroEngine.js';
import { CanvasRenderer } from './engine/canvasRenderer.js';
import { GearRenderer } from './engine/gearRenderer.js';
import { AudioSynthesizer } from './audio/audioSynthesizer.js';
import { LayerManager } from './components/layerManager.js';
import { UIController } from './components/uiController.js';
import { Exporter } from './components/exporter.js';

class SpirographApp {
  constructor() {
    this.bgCanvas = document.getElementById('bg-canvas');
    this.drawingCanvas = document.getElementById('drawing-canvas');
    this.activeCanvas = document.getElementById('active-canvas');
    this.gearCanvas = document.getElementById('gear-canvas');
    this.wrapper = document.getElementById('canvas-wrapper');

    // Engine & Renderers
    this.canvasRenderer = new CanvasRenderer(this.drawingCanvas, this.activeCanvas, this.bgCanvas);
    this.gearRenderer = new GearRenderer(this.gearCanvas);
    this.audio = new AudioSynthesizer();

    // App State
    this.mode = 'hypo';
    this.R = 105;
    this.r = 63;
    this.dRatio = 0.65;
    this.color = '#3a86ff';
    this.penMode = 'solid';
    this.strokeWidth = 2.0;
    this.opacity = 0.9;
    this.speed = 15;
    this.paperTheme = 'studio';

    this.isPlaying = false;
    this.manualDrag = false;
    this.isDragging = false;
    this.animationFrame = null;
    this.currentPathData = null;
    this.currentPointIndex = 0;

    // Layer Stack Manager
    this.layerManager = new LayerManager((layers, activeLayer) => {
      this.ui.renderLayersList(layers, activeLayer);
      this.canvasRenderer.renderLayers(layers);
    });

    // UI Controller
    this.ui = new UIController(this);

    // Initialize
    this.initWindowResize();
    this.initDefaultLayer();
    this.initDragControls();
  }

  initWindowResize() {
    const handleResize = () => {
      const w = this.wrapper.clientWidth;
      const h = this.wrapper.clientHeight;
      this.canvasRenderer.resize(w, h);
      this.gearRenderer.resize(w, h);
      this.canvasRenderer.renderLayers(this.layerManager.getLayers());
      this.renderGearOverlay();
    };

    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 50);
  }

  initDefaultLayer() {
    const params = {
      R: this.R,
      r: this.r,
      dRatio: this.dRatio,
      mode: this.mode,
      color: this.color,
      penMode: this.penMode,
      width: this.strokeWidth,
      opacity: this.opacity
    };
    
    this.recalculateCurrentPath();
    this.layerManager.createDefaultLayer(params, [], 0);
    this.ui.updateMathDisplay(this.currentPathData.stats, this.R, this.r, this.dRatio);
  }

  recalculateCurrentPath() {
    this.currentPathData = generateSpirographPath(
      this.R,
      this.r,
      this.dRatio,
      this.mode
    );
    this.currentPointIndex = 0;
  }

  /**
   * Render Gear Overlay at current point index
   */
  renderGearOverlay() {
    if (!this.currentPathData || !this.currentPathData.points.length) return;

    const points = this.currentPathData.points;
    const idx = Math.min(this.currentPointIndex, points.length - 1);
    const pt = points[idx];

    this.gearRenderer.drawGears({
      R: this.R,
      r: this.r,
      dRatio: this.dRatio,
      mode: this.mode,
      wheelX: pt.wheelX,
      wheelY: pt.wheelY,
      wheelAngle: pt.wheelAngle,
      penX: pt.x,
      penY: pt.y
    }, this.canvasRenderer.zoomScale);
  }

  // --- Animation Control Loop ---
  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.ui.updatePlayButton(true);

    if (this.currentPointIndex >= this.currentPathData.points.length - 1) {
      this.currentPointIndex = 0;
    }

    const animate = () => {
      if (!this.isPlaying) return;

      const total = this.currentPathData.points.length;
      this.currentPointIndex += this.speed;

      if (this.currentPointIndex >= total) {
        this.currentPointIndex = total - 1;
        this.pause();
        this.finishDrawingActiveLayer();
        return;
      }

      const progress = this.currentPointIndex / total;
      this.ui.updateProgress(progress);

      const activeLayer = this.layerManager.getActiveLayer();
      this.canvasRenderer.renderActiveStroke(this.currentPathData.points, activeLayer, progress);
      this.renderGearOverlay();
      this.audio.playGearClick();

      this.animationFrame = requestAnimationFrame(animate);
    };

    animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.ui.updatePlayButton(false);
  }

  instantComplete() {
    this.pause();
    this.currentPointIndex = this.currentPathData.points.length - 1;
    this.ui.updateProgress(1.0);
    this.finishDrawingActiveLayer();
    this.renderGearOverlay();
  }

  finishDrawingActiveLayer() {
    const activeLayer = this.layerManager.getActiveLayer();
    if (activeLayer) {
      activeLayer.points = this.currentPathData.points;
      activeLayer.progress = 1.0;
      this.canvasRenderer.clearActiveCanvas();
      this.canvasRenderer.renderLayers(this.layerManager.getLayers());
    }
  }

  setProgress(pct) {
    const total = this.currentPathData.points.length;
    this.currentPointIndex = Math.floor(pct * total);
    const progress = this.currentPointIndex / total;

    const activeLayer = this.layerManager.getActiveLayer();
    this.canvasRenderer.renderActiveStroke(this.currentPathData.points, activeLayer, progress);
    this.renderGearOverlay();
  }

  // --- Parameter Updaters ---
  setMode(mode) {
    this.mode = mode;
    this.updateActiveParameters();
  }

  setRing(R) {
    this.R = R;
    this.updateActiveParameters();
  }

  setWheel(r) {
    this.r = r;
    this.updateActiveParameters();
  }

  setPenDist(dRatio) {
    this.dRatio = dRatio;
    this.updateActiveParameters();
  }

  setColor(color) {
    this.color = color;
    this.layerManager.updateActiveLayer({ color });
    this.canvasRenderer.renderLayers(this.layerManager.getLayers());
  }

  setPenMode(penMode) {
    this.penMode = penMode;
    this.layerManager.updateActiveLayer({ penMode });
    this.canvasRenderer.renderLayers(this.layerManager.getLayers());
  }

  setStrokeWidth(width) {
    this.strokeWidth = width;
    this.layerManager.updateActiveLayer({ width });
    this.canvasRenderer.renderLayers(this.layerManager.getLayers());
  }

  setOpacity(opacity) {
    this.opacity = opacity;
    this.layerManager.updateActiveLayer({ opacity });
    this.canvasRenderer.renderLayers(this.layerManager.getLayers());
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setPaperTheme(theme) {
    this.paperTheme = theme;
    document.body.className = `theme-${theme}`;
  }

  setGearVisibility(visible) {
    this.gearRenderer.visible = visible;
    this.renderGearOverlay();
  }

  setManualDragMode(active) {
    this.manualDrag = active;
    if (active) this.pause();
  }

  updateActiveParameters() {
    this.pause();
    this.recalculateCurrentPath();
    this.layerManager.updateActiveLayer({
      R: this.R,
      r: this.r,
      dRatio: this.dRatio,
      mode: this.mode
    }, this.currentPathData.points);

    this.ui.updateMathDisplay(this.currentPathData.stats, this.R, this.r, this.dRatio);
    this.canvasRenderer.renderActiveStroke(this.currentPathData.points, this.layerManager.getActiveLayer(), 0.001);
    this.renderGearOverlay();
  }

  // --- Multi-Layer Actions ---
  addNewLayer() {
    this.pause();
    this.recalculateCurrentPath();
    this.currentTheta = 0;
    const params = {
      R: this.R,
      r: this.r,
      dRatio: this.dRatio,
      mode: this.mode,
      color: this.color,
      penMode: this.penMode,
      width: this.strokeWidth,
      opacity: this.opacity
    };
    this.layerManager.createDefaultLayer(params, [], 0);
    this.renderGearOverlay();
  }

  selectLayer(id) {
    this.layerManager.selectLayer(id);
    const active = this.layerManager.getActiveLayer();
    if (active) {
      this.R = active.R;
      this.r = active.r;
      this.dRatio = active.dRatio;
      this.mode = active.mode;
      this.color = active.color;
      this.penMode = active.penMode;
      this.strokeWidth = active.width;
      this.opacity = active.opacity;
      this.recalculateCurrentPath();
      this.ui.updateMathDisplay(this.currentPathData.stats, this.R, this.r, this.dRatio);
    }
  }

  toggleLayerVis(id) {
    this.layerManager.toggleVisibility(id);
  }

  duplicateLayer(id) {
    this.layerManager.duplicateLayer(id);
  }

  deleteLayer(id) {
    this.layerManager.deleteLayer(id);
  }

  clearCurrentLayer() {
    this.pause();
    this.layerManager.clearActiveLayer();
    this.currentPointIndex = 0;
    this.currentTheta = 0;
    this.ui.updateProgress(0);
    this.canvasRenderer.clearActiveCanvas();
    this.canvasRenderer.renderLayers(this.layerManager.getLayers());
    this.renderGearOverlay();
  }

  clearAllLayers() {
    this.pause();
    this.layerManager.clearAllLayers();
    this.currentPointIndex = 0;
    this.currentTheta = 0;
    this.ui.updateProgress(0);
    this.canvasRenderer.clearActiveCanvas();
    this.initDefaultLayer();
    this.renderGearOverlay();
  }

  loadPreset(preset) {
    this.pause();
    this.setPaperTheme(preset.paper);
    this.R = preset.R;
    this.r = preset.r;
    this.dRatio = preset.dRatio;
    this.mode = preset.mode;
    this.color = preset.color;
    this.penMode = preset.penMode;
    this.strokeWidth = preset.width;
    this.opacity = preset.opacity;

    // Sync UI elements
    this.ui.ringSlider.value = this.R;
    this.ui.wheelSlider.value = this.r;
    this.ui.penDistSlider.value = this.dRatio;

    this.recalculateCurrentPath();
    this.layerManager.createDefaultLayer({
      R: this.R,
      r: this.r,
      dRatio: this.dRatio,
      mode: this.mode,
      color: this.color,
      penMode: this.penMode,
      width: this.strokeWidth,
      opacity: this.opacity
    }, this.currentPathData.points, 1.0);

    this.ui.updateMathDisplay(this.currentPathData.stats, this.R, this.r, this.dRatio);
    this.instantComplete();
  }

  // --- Manual Drag Control ---
  initDragControls() {
    this.lastPointerAngle = null;
    this.currentTheta = 0;

    const handlePointerDown = (e) => {
      if (!this.manualDrag) return;
      this.isDragging = true;
      this.gearCanvas.style.cursor = 'grabbing';

      const rect = this.gearCanvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const px = e.clientX - rect.left - cx;
      const py = e.clientY - rect.top - cy;

      this.lastPointerAngle = Math.atan2(py, px);
      const totalPoints = this.currentPathData.points.length;
      this.currentTheta = (this.currentPointIndex / totalPoints) * this.currentPathData.maxTheta;
    };

    const handlePointerMove = (e) => {
      if (!this.isDragging || !this.manualDrag) return;
      this.updateDragProgress(e);
    };

    const handlePointerUp = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.lastPointerAngle = null;
        if (this.gearCanvas) {
          this.gearCanvas.style.cursor = this.manualDrag ? 'grab' : 'default';
        }
      }
    };

    this.gearCanvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  updateDragProgress(e) {
    if (this.lastPointerAngle === null) return;

    const rect = this.gearCanvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const px = e.clientX - rect.left - cx;
    const py = e.clientY - rect.top - cy;

    const currentAngle = Math.atan2(py, px);
    let deltaAngle = currentAngle - this.lastPointerAngle;

    // Handle smooth wrap-around across -PI / +PI quadrant boundary
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

    const maxTheta = this.currentPathData.maxTheta;
    this.currentTheta += deltaAngle;

    if (this.currentTheta < 0) this.currentTheta = 0;
    if (this.currentTheta >= maxTheta) {
      this.currentTheta = maxTheta;
    }

    this.lastPointerAngle = currentAngle;

    const totalPoints = this.currentPathData.points.length;
    const targetIdx = Math.min(
      totalPoints - 1,
      Math.max(0, Math.floor((this.currentTheta / maxTheta) * totalPoints))
    );

    if (Math.abs(targetIdx - this.currentPointIndex) > 1) {
      this.audio.playGearClick();
    }

    this.currentPointIndex = targetIdx;
    const progress = this.currentPointIndex / totalPoints;
    this.ui.updateProgress(progress);

    const activeLayer = this.layerManager.getActiveLayer();
    this.canvasRenderer.renderActiveStroke(this.currentPathData.points, activeLayer, progress);
    this.renderGearOverlay();

    // Auto-commit active layer on 100% manual completion
    if (progress >= 0.999) {
      this.finishDrawingActiveLayer();
      this.isDragging = false;
      this.lastPointerAngle = null;
    }
  }

  // --- Audio & Export ---
  toggleAudio() {
    return this.audio.toggleAudio();
  }

  exportPNG(bgTheme) {
    Exporter.exportPNG(this.drawingCanvas, bgTheme);
  }

  exportSVG() {
    Exporter.exportSVG(
      this.layerManager.getLayers(),
      this.wrapper.clientWidth,
      this.wrapper.clientHeight
    );
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SpirographApp();
});
