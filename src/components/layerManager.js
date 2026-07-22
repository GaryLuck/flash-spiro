/**
 * Multi-layer Drawing Stack Manager
 * Manages adding, editing, hiding, deleting, and reordering spirograph layers.
 */

export class LayerManager {
  constructor(onLayersChanged) {
    this.layers = [];
    this.activeLayerId = null;
    this.onLayersChanged = onLayersChanged;
    this.nextId = 1;
  }

  createDefaultLayer(params, points) {
    const id = `layer-${this.nextId++}`;
    const newLayer = {
      id,
      name: `Pattern ${this.nextId - 1}`,
      visible: true,
      locked: false,
      progress: 1.0,
      points: points || [],
      ...params
    };

    this.layers.unshift(newLayer); // Newest on top
    this.activeLayerId = id;
    this.notify();
    return newLayer;
  }

  getActiveLayer() {
    return this.layers.find(l => l.id === this.activeLayerId) || this.layers[0];
  }

  updateActiveLayer(params, points) {
    const active = this.getActiveLayer();
    if (!active) return;

    Object.assign(active, params);
    if (points) {
      active.points = points;
    }
    this.notify();
  }

  setActiveLayerProgress(progress) {
    const active = this.getActiveLayer();
    if (active) {
      active.progress = progress;
      this.notify();
    }
  }

  selectLayer(id) {
    this.activeLayerId = id;
    this.notify();
  }

  toggleVisibility(id) {
    const layer = this.layers.find(l => l.id === id);
    if (layer) {
      layer.visible = !layer.visible;
      this.notify();
    }
  }

  deleteLayer(id) {
    if (this.layers.length <= 1) {
      // Keep at least one clear layer
      this.layers[0].points = [];
      this.notify();
      return;
    }
    this.layers = this.layers.filter(l => l.id !== id);
    if (this.activeLayerId === id) {
      this.activeLayerId = this.layers[0].id;
    }
    this.notify();
  }

  duplicateLayer(id) {
    const layer = this.layers.find(l => l.id === id);
    if (!layer) return;

    const dupId = `layer-${this.nextId++}`;
    const dup = {
      ...layer,
      id: dupId,
      name: `${layer.name} (Copy)`,
      points: [...layer.points]
    };

    const idx = this.layers.findIndex(l => l.id === id);
    this.layers.splice(idx, 0, dup);
    this.activeLayerId = dupId;
    this.notify();
  }

  clearActiveLayer() {
    const active = this.getActiveLayer();
    if (active) {
      active.points = [];
      active.progress = 0;
      this.notify();
    }
  }

  clearAllLayers() {
    this.layers = [];
    this.notify();
  }

  notify() {
    if (typeof this.onLayersChanged === 'function') {
      this.onLayersChanged(this.layers, this.getActiveLayer());
    }
  }
}
