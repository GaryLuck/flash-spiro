/**
 * UI Controller
 * Binds UI widgets, sliders, hole selectors, preset gallery modal, layer stack cards, and user input events.
 */

import { PRESETS } from '../presets/presetLibrary.js';
import { generateSpirographPath } from '../engine/spiroEngine.js';

export class UIController {
  constructor(app) {
    this.app = app;
    this.initDOMReferences();
    this.bindEvents();
    this.renderHolePicker();
    this.renderPresetGallery();
  }

  initDOMReferences() {
    // Mode Buttons
    this.modeControl = document.getElementById('mode-control');

    // Geometry Sliders & Badges
    this.ringSlider = document.getElementById('ring-radius-slider');
    this.ringVal = document.getElementById('ring-radius-val');
    this.ringPresets = document.getElementById('ring-presets');

    this.wheelSlider = document.getElementById('wheel-radius-slider');
    this.wheelVal = document.getElementById('wheel-radius-val');
    this.wheelPresets = document.getElementById('wheel-presets');

    this.penDistSlider = document.getElementById('pen-dist-slider');
    this.penDistVal = document.getElementById('pen-dist-val');
    this.holePicker = document.getElementById('hole-picker');

    // Math Summary
    this.mathRatio = document.getElementById('math-ratio');
    this.mathPetals = document.getElementById('math-petals');
    this.mathRevs = document.getElementById('math-revs');

    // Styling Controls
    this.penModeControl = document.getElementById('pen-mode-control');
    this.solidColorGroup = document.getElementById('solid-color-group');
    this.colorSwatches = document.getElementById('color-swatches');
    this.customColorPicker = document.getElementById('custom-color-picker');

    this.strokeWidthSlider = document.getElementById('stroke-width-slider');
    this.strokeWidthVal = document.getElementById('stroke-width-val');

    this.opacitySlider = document.getElementById('opacity-slider');
    this.opacityVal = document.getElementById('opacity-val');

    // Header Controls
    this.btnPresets = document.getElementById('btn-presets');
    this.presetsModal = document.getElementById('presets-modal');
    this.btnClosePresets = document.getElementById('btn-close-presets');
    this.presetGrid = document.getElementById('preset-grid');

    this.btnPaperDropdown = document.getElementById('btn-paper-dropdown');
    this.paperMenu = document.getElementById('paper-menu');
    this.currentPaperName = document.getElementById('current-paper-name');

    this.btnAudioToggle = document.getElementById('btn-audio-toggle');
    this.audioIcon = document.getElementById('audio-icon');

    this.btnClearCanvas = document.getElementById('btn-clear-canvas');

    this.btnExportDropdown = document.getElementById('btn-export-dropdown');
    this.exportMenu = document.getElementById('export-menu');
    this.exportPngHigh = document.getElementById('export-png-high');
    this.exportPngTrans = document.getElementById('export-png-transparent');
    this.exportSvg = document.getElementById('export-svg');

    // On-Canvas & Playback
    this.btnToggleGears = document.getElementById('btn-toggle-gears');
    this.btnToggleManual = document.getElementById('btn-toggle-manual');

    this.btnPlayPause = document.getElementById('btn-play-pause');
    this.playIcon = document.getElementById('play-icon');
    this.playText = document.getElementById('play-text');

    this.btnInstantDraw = document.getElementById('btn-instant-draw');

    this.progressSlider = document.getElementById('draw-progress-slider');
    this.progressVal = document.getElementById('progress-val');

    this.speedSlider = document.getElementById('draw-speed-slider');
    this.speedVal = document.getElementById('speed-val');

    // Right Sidebar Layers
    this.btnAddLayer = document.getElementById('btn-add-layer');
    this.layerList = document.getElementById('layer-list');
  }

  bindEvents() {
    // Mode switcher (Hypo vs Epi)
    this.modeControl.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.modeControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.app.setMode(btn.dataset.mode);
      });
    });

    // Ring slider & pill presets
    this.ringSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.updatePillActive(this.ringPresets, val, 'data-ring');
      this.app.setRing(val);
    });

    this.ringPresets.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.ring, 10);
        this.ringSlider.value = val;
        this.updatePillActive(this.ringPresets, val, 'data-ring');
        this.app.setRing(val);
      });
    });

    // Wheel slider & pill presets
    this.wheelSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.updatePillActive(this.wheelPresets, val, 'data-wheel');
      this.app.setWheel(val);
    });

    this.wheelPresets.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.wheel, 10);
        this.wheelSlider.value = val;
        this.updatePillActive(this.wheelPresets, val, 'data-wheel');
        this.app.setWheel(val);
      });
    });

    // Pen distance slider
    this.penDistSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.app.setPenDist(val);
    });

    // Pen Mode (Solid, Rainbow, Glow)
    this.penModeControl.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.penModeControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const penMode = btn.dataset.penmode;
        this.app.setPenMode(penMode);
      });
    });

    // Color Swatches & Custom Picker
    this.colorSwatches.querySelectorAll('.swatch').forEach(btn => {
      btn.addEventListener('click', () => {
        this.colorSwatches.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.app.setColor(btn.dataset.color);
      });
    });

    this.customColorPicker.addEventListener('input', (e) => {
      this.colorSwatches.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      this.app.setColor(e.target.value);
    });

    // Stroke width & opacity sliders
    this.strokeWidthSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.strokeWidthVal.textContent = `${val.toFixed(1)} px`;
      this.app.setStrokeWidth(val);
    });

    this.opacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.opacityVal.textContent = `${Math.round(val * 100)}%`;
      this.app.setOpacity(val);
    });

    // Play / Pause
    this.btnPlayPause.addEventListener('click', () => {
      this.app.togglePlayPause();
    });

    // Instant draw
    this.btnInstantDraw.addEventListener('click', () => {
      this.app.instantComplete();
    });

    // Progress & Speed sliders
    this.progressSlider.addEventListener('input', (e) => {
      const pct = parseFloat(e.target.value) / 100;
      this.app.setProgress(pct);
    });

    this.speedSlider.addEventListener('input', (e) => {
      const speed = parseInt(e.target.value, 10);
      this.speedVal.textContent = `${speed}x`;
      this.app.setSpeed(speed);
    });

    // Gear Visibility Toggle
    this.btnToggleGears.addEventListener('click', () => {
      const active = this.btnToggleGears.classList.toggle('active');
      this.app.setGearVisibility(active);
    });

    // Manual Crank Toggle
    this.btnToggleManual.addEventListener('click', () => {
      const active = this.btnToggleManual.classList.toggle('active');
      this.app.setManualDragMode(active);
    });

    // Paper Dropdown
    this.btnPaperDropdown.addEventListener('click', () => {
      this.paperMenu.parentElement.classList.toggle('open');
    });

    this.paperMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        this.paperMenu.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const theme = item.dataset.paper;
        this.currentPaperName.textContent = item.textContent.trim();
        this.app.setPaperTheme(theme);
        this.paperMenu.parentElement.classList.remove('open');
      });
    });

    // Export Dropdown
    this.btnExportDropdown.addEventListener('click', () => {
      this.exportMenu.parentElement.classList.toggle('open');
    });

    this.exportPngHigh.addEventListener('click', () => {
      this.app.exportPNG(this.app.paperTheme);
      this.exportMenu.parentElement.classList.remove('open');
    });

    this.exportPngTrans.addEventListener('click', () => {
      this.app.exportPNG('transparent');
      this.exportMenu.parentElement.classList.remove('open');
    });

    this.exportSvg.addEventListener('click', () => {
      this.app.exportSVG();
      this.exportMenu.parentElement.classList.remove('open');
    });

    // Audio Toggle
    this.btnAudioToggle.addEventListener('click', () => {
      const enabled = this.app.toggleAudio();
      this.audioIcon.className = enabled ? 'ri-volume-up-line' : 'ri-volume-mute-line';
    });

    // Clear Dropdown
    this.btnClearDropdown = document.getElementById('btn-clear-dropdown');
    this.clearMenu = document.getElementById('clear-menu');
    this.btnClearActive = document.getElementById('btn-clear-active');
    this.btnClearAll = document.getElementById('btn-clear-all');

    this.btnClearDropdown.addEventListener('click', () => {
      this.clearMenu.parentElement.classList.toggle('open');
    });

    this.btnClearActive.addEventListener('click', () => {
      this.app.clearCurrentLayer();
      this.clearMenu.parentElement.classList.remove('open');
    });

    this.btnClearAll.addEventListener('click', () => {
      this.app.clearAllLayers();
      this.clearMenu.parentElement.classList.remove('open');
    });

    // Preset Modal
    this.btnPresets.addEventListener('click', () => {
      this.presetsModal.classList.add('open');
    });

    this.btnClosePresets.addEventListener('click', () => {
      this.presetsModal.classList.remove('open');
    });

    // Add Layer
    this.btnAddLayer.addEventListener('click', () => {
      this.app.addNewLayer();
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.app.togglePlayPause();
      } else if (e.code === 'KeyC') {
        this.app.clearCurrentLayer();
      }
    });
  }

  updatePillActive(container, value, attributeName) {
    container.querySelectorAll('.pill-btn').forEach(btn => {
      const btnVal = parseInt(btn.getAttribute(attributeName), 10);
      btn.classList.toggle('active', btnVal === value);
    });
  }

  renderHolePicker() {
    this.holePicker.innerHTML = '';
    const totalHoles = 10;
    for (let h = 1; h <= totalHoles; h++) {
      const ratio = h / (totalHoles + 1);
      const dot = document.createElement('div');
      dot.className = 'hole-dot';
      dot.textContent = `${h}`;
      dot.dataset.ratio = ratio;
      dot.title = `Hole #${h} (${Math.round(ratio * 100)}%)`;

      dot.addEventListener('click', () => {
        this.penDistSlider.value = ratio;
        this.app.setPenDist(ratio);
      });

      this.holePicker.appendChild(dot);
    }
  }

  updateHolePickerActive(dRatio) {
    const totalHoles = 10;
    this.holePicker.querySelectorAll('.hole-dot').forEach((dot, idx) => {
      const ratio = (idx + 1) / (totalHoles + 1);
      dot.classList.toggle('active', Math.abs(ratio - dRatio) < 0.05);
    });
  }

  updateMathDisplay(stats, R, r, dRatio) {
    this.ringVal.textContent = `${R} teeth`;
    this.wheelVal.textContent = `${r} teeth`;
    const holeIdx = Math.round(dRatio * 11);
    this.penDistVal.textContent = `Hole #${holeIdx} (${Math.round(dRatio * 100)}%)`;

    this.mathRatio.textContent = `${R / stats.gcd} : ${r / stats.gcd}`;
    this.mathPetals.textContent = `${stats.petals} Petals`;
    this.mathRevs.textContent = `${stats.revolutions} Loops`;
    this.updateHolePickerActive(dRatio);
  }

  updatePlayButton(isPlaying) {
    this.playIcon.className = isPlaying ? 'ri-pause-fill' : 'ri-play-fill';
    this.playText.textContent = isPlaying ? 'Pause' : 'Start Drawing';
  }

  updateProgress(pct) {
    this.progressSlider.value = Math.round(pct * 100);
    this.progressVal.textContent = `${Math.round(pct * 100)}%`;
  }

  renderLayersList(layers, activeLayer) {
    this.layerList.innerHTML = '';
    layers.forEach(layer => {
      const card = document.createElement('div');
      card.className = `layer-card ${layer.id === activeLayer.id ? 'active' : ''}`;

      card.innerHTML = `
        <div class="layer-info">
          <div class="layer-color-dot" style="background: ${layer.color};"></div>
          <div>
            <div class="layer-name">${layer.name}</div>
            <div class="layer-details">${layer.R}T / ${layer.r}T (${layer.mode.toUpperCase()})</div>
          </div>
        </div>
        <div class="layer-actions">
          <button class="btn-icon-small btn-toggle-vis" title="Hide/Show"><i class="${layer.visible ? 'ri-eye-line' : 'ri-eye-off-line'}"></i></button>
          <button class="btn-icon-small btn-dup-layer" title="Duplicate"><i class="ri-file-copy-line"></i></button>
          <button class="btn-icon-small btn-del-layer" title="Delete"><i class="ri-delete-bin-line"></i></button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (!e.target.closest('.layer-actions')) {
          this.app.selectLayer(layer.id);
        }
      });

      card.querySelector('.btn-toggle-vis').addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.toggleLayerVis(layer.id);
      });

      card.querySelector('.btn-dup-layer').addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.duplicateLayer(layer.id);
      });

      card.querySelector('.btn-del-layer').addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.deleteLayer(layer.id);
      });

      this.layerList.appendChild(card);
    });
  }

  renderPresetGallery() {
    this.presetGrid.innerHTML = '';
    PRESETS.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `
        <div class="preset-preview-box">
          <canvas id="preset-cv-${preset.id}" width="200" height="140"></canvas>
        </div>
        <div>
          <div class="preset-title">${preset.title}</div>
          <div class="preset-details">${preset.R}T Ring / ${preset.r}T Wheel (${preset.mode.toUpperCase()})</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.app.loadPreset(preset);
        this.presetsModal.classList.remove('open');
      });

      this.presetGrid.appendChild(card);

      // Render thumbnail on canvas
      setTimeout(() => {
        const cv = document.getElementById(`preset-cv-${preset.id}`);
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const data = generateSpirographPath(preset.R, preset.r, preset.dRatio, preset.mode, 0.05);
        
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.save();
        ctx.translate(100, 70);
        ctx.scale(0.4, 0.4);
        ctx.strokeStyle = preset.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        data.points.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }, 50);
    });
  }
}
